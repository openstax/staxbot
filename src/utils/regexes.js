export const whitespaceCharacters = '\\s\\r'
export const newlineCharacters = '\\n\\r'
export const whitespace = `[${whitespaceCharacters}]`
export const newline = `[${newlineCharacters}]`

export const beginningOfStringOrNewline = `^(.+${newline}+)*${newline}*`
export const beginningOfStringOrWhitespace = `^([^${whitespaceCharacters}]+[${whitespaceCharacters}]+)*[${whitespaceCharacters}]*`
export const endOfStringOrWhitespace = `([${whitespaceCharacters}]+[^${whitespaceCharacters}]+)*[${whitespaceCharacters}]*$`

export const listPrefix = '\\n\\- \\[( |x)\\] '

/* eslint-disable-next-line */
export const githubRefGroups = '(?<owner>[a-z\-]+)\/(?<repo>[a-z\-]+)#(?<number>[0-9]+)'
/* eslint-disable-next-line */
export const githubIssueLinkGroups = 'https:\/\/github.com\/(?<owner>[a-z\-]+)\/(?<repo>[a-z\-]+)\/issues\/(?<number>[0-9]+)'
/* eslint-disable-next-line */
export const githubPullRequestLinkGroups = 'https:\/\/github.com\/(?<owner>[a-z\-]+)\/(?<repo>[a-z\-]+)\/pulls\/(?<number>[0-9]+)'
/* eslint-disable-next-line */
export const zenhubLinkGroups = 'https:\/\/app.zenhub.com\/workspaces\/[0-9a-z\-]+\/issues\/(?<owner>[a-z\-]+)\/(?<repo>[a-z\-]+)\/(?<number>[0-9]+)'

/* eslint-disable-next-line */
export const githubRef = '[a-z\-]+\/[a-z\-]+#[0-9]+'
/* eslint-disable-next-line */
export const githubPullRequestLink = 'https:\/\/github.com\/[a-z\-]+\/[a-z\-]+\/pulls\/[0-9]+'
/* eslint-disable-next-line */
export const zenhubLink = 'https:\/\/app.zenhub.com\/workspaces\/[0-9a-z\-]+\/issues\/[a-z\-]+\/[a-z\-]+\/[0-9]+'
