// Build-time only: fetches GitHub data and writes data/github.json. The token never reaches the browser.
import {mkdir, writeFile} from 'node:fs/promises';
import {whyItMatters} from '../js/content.js';

// The featured projects have their own section on the page, so these cards must not repeat them.
const featured = new Set(Object.keys(whyItMatters));

const USER = 'AlfredBateman';
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN is not set');

const headers = {
  Authorization: `Bearer ${token}`,
  'User-Agent': 'portfolio-fetch',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function get(url, init) {
  const res = await fetch(url, {...init, headers: {...headers, ...init?.headers}});
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${await res.text()}`);
  return res.json();
}

const query = `query($login:String!){
  user(login:$login){
    contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}
    pinnedItems(first:6,types:REPOSITORY){nodes{... on Repository{...R}}}
    recent:repositories(first:20,ownerAffiliations:OWNER,isFork:false,isArchived:false,privacy:PUBLIC,orderBy:{field:PUSHED_AT,direction:DESC}){nodes{...R}}
    repositories(first:100,ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC){nodes{languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
  }
}
fragment R on Repository{name description url stargazerCount forkCount isArchived isFork primaryLanguage{name color}}`;
const gql = await get('https://api.github.com/graphql', {
  method: 'POST',
  body: JSON.stringify({query, variables: {login: USER}}),
});
if (gql.errors) throw new Error('GraphQL: ' + JSON.stringify(gql.errors));
const user = gql.data?.user;
if (!user) throw new Error('GraphQL returned no user');

const cal = user.contributionsCollection.contributionCalendar;
// The calendar is padded to whole weeks (~370 days); keep exactly the last 365.
const days = cal.weeks.flatMap(w => w.contributionDays).map(d => ({date: d.date, count: d.contributionCount})).slice(-365);
if (!days.length) throw new Error('contribution calendar is empty');
// ponytail: an all-zero year means the token can't see contributions (or the profile is empty); fail rather than deploy a blank graph.
const total = days.reduce((a, d) => a + d.count, 0);
if (!total) throw new Error('contribution total is 0: token likely cannot read contribution data');

// Pinned repos that aren't featured; if none, the most recently pushed public non-fork non-archived ones.
const notFeatured = r => !featured.has(r.name.toLowerCase());
let picks = user.pinnedItems.nodes.filter(notFeatured);
if (!picks.length) picks = user.recent.nodes.filter(r => notFeatured(r) && !r.isFork && !r.isArchived).slice(0, 6);
const pinned = picks.map(r => ({
  name: r.name, description: r.description, url: r.url,
  stars: r.stargazerCount, forks: r.forkCount,
  language: r.primaryLanguage?.name ?? null, color: r.primaryLanguage?.color ?? null,
}));

// Top languages across non-fork public repos, weighted by bytes.
const bytes = new Map(), colors = new Map();
for (const repo of user.repositories.nodes) for (const {size, node} of repo.languages.edges) {
  bytes.set(node.name, (bytes.get(node.name) ?? 0) + size);
  colors.set(node.name, node.color);
}
const sum = [...bytes.values()].reduce((x, y) => x + y, 0);
const languages = [...bytes].sort((x, y) => y[1] - x[1]).slice(0, 6)
  .map(([name, n]) => ({name, percent: +(100 * n / sum).toFixed(1), color: colors.get(name)}));

// Last 5 push / PR / issue events.
const kinds = {PushEvent: 'push', PullRequestEvent: 'pull request', IssuesEvent: 'issue'};
const events = (await get(`https://api.github.com/users/${USER}/events/public?per_page=100`))
  .filter(e => kinds[e.type]).slice(0, 5).map(e => {
    const p = e.payload;
    const detail = e.type === 'PushEvent' ? `pushed to ${p.ref.replace('refs/heads/', '')}`
      : e.type === 'PullRequestEvent' ? `${p.action}: ${p.pull_request.title}`
      : `${p.action}: ${p.issue.title}`;
    const url = e.type === 'PullRequestEvent' ? p.pull_request.html_url
      : e.type === 'IssuesEvent' ? p.issue.html_url
      : `https://github.com/${e.repo.name}`;
    return {type: kinds[e.type], repo: e.repo.name, detail, url, at: e.created_at};
  });

await mkdir('data', {recursive: true});
await writeFile('data/github.json', JSON.stringify({
  generatedAt: new Date().toISOString(), user: USER,
  total, days, pinned, languages, events,
}, null, 1) + '\n');
console.log(`data/github.json: ${days.length} days, ${total} contributions, ${pinned.length} pinned, ${events.length} events`);
