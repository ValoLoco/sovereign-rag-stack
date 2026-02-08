/**
 * GitHub sync utilities for web mode
 */

import { Octokit } from '@octokit/rest'
import { sql } from '@vercel/postgres'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const REPO_OWNER = 'ValoLoco'
const REPO_NAME = 'sovereign-rag-stack'

export async function syncFromGitHub() {
  // Get latest state from GitHub
  const { data } = await octokit.repos.getContent({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: 'shared/state.json'
  })
  
  if ('content' in data) {
    const stateContent = Buffer.from(data.content, 'base64').toString()
    const state = JSON.parse(stateContent)
    
    // Update local Vercel database
    await updateVercelDatabase(state)
    
    return state
  }
  
  throw new Error('Failed to fetch state')
}

export async function syncToGitHub(changes: any) {
  // Commit changes to GitHub
  await octokit.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: `shared/${changes.path}`,
    message: `Sync from web: ${changes.description}`,
    content: Buffer.from(JSON.stringify(changes.data)).toString('base64'),
    branch: 'sync'
  })
}

async function updateVercelDatabase(state: any) {
  // Update Postgres with synced state
  for (const [key, value] of Object.entries(state.files)) {
    await sql`
      INSERT INTO sync_state (file_path, hash, last_modified, source)
      VALUES (${key}, ${value.hash}, ${value.last_modified}, ${value.source})
      ON CONFLICT (file_path) 
      DO UPDATE SET 
        hash = EXCLUDED.hash,
        last_modified = EXCLUDED.last_modified,
        source = EXCLUDED.source
    `
  }
}
