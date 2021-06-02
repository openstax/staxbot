import {getVersions, getVersion, setVersions, setVersion} from '../../src/utils/versionsBlock.js'

const exampleBlock = `# versions
- openstax/rex-web (sha): dfde202
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1
`

const expected = {
  'openstax/rex-web (sha)': 'dfde202',
  'openstax/rex-web (release id)': 'master/dfde202',
  'openstax/highlights-api (sha)': '8575ef7',
  'openstax/highlights-api (ami)': 'ami-000167d12cf19dce1'
}

describe('getVersions', () => {
  test('resolves basic block', () => {
    const result = getVersions(exampleBlock)
    expect(result).toEqual(expected)
  })

  test('resolves with text before', () => {
    const result = getVersions('asdf\n\rasdf\n\rasdf\n\r' + exampleBlock)
    expect(result).toEqual(expected)
  })

  test('resolves with text around', () => {
    const result = getVersions('asdf\n\rasdf\n\rasdf\n\r' + exampleBlock + 'asdf\n\rasdf\n\rasdf\n\r')
    expect(result).toEqual(expected)
  })

  test('resolves with text after', () => {
    const result = getVersions(exampleBlock + 'asdf\n\rasdf\n\rasdf\n\r')
    expect(result).toEqual(expected)
  })

  test('pipeline title must be on ownline', () => {
    const result = getVersions('asdf\n\rasdf\n\rasdf' + exampleBlock)
    expect(result).toEqual(null)
  })

  test('doesn\'t match pr block', () => {
    const result = getVersions('pull requests: \n- [ ] https://github.com/openstax/rex-web/pulls/123')
    expect(result).toEqual(null)
  })

  test('doesn\'t match pr block earlier in body', () => {
    const result = getVersions('pull requests: \n- [ ] https://github.com/openstax/rex-web/pulls/123\n\radsf\n\r' + exampleBlock)
    expect(result).toEqual(expected)
  })
})

describe('getVersion', () => {
  test('gets version', () => {
    const result = getVersion(exampleBlock, 'openstax/highlights-api (ami)')
    expect(result).toEqual('ami-000167d12cf19dce1')
  })

  test('returns undefined if not found', () => {
    const result = getVersion(exampleBlock, 'asdfasdf')
    expect(result).toEqual(undefined)
  })
})

describe('setVersions', () => {
  test('sets versions', () => {
    const newVersions = {...expected, 'openstax/rex-web (sha)': 'foobar'}
    const result = setVersions(`asdf
asdf
${exampleBlock}asdf
asdf
`, newVersions)
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (sha): foobar
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1
asdf
asdf
`)
  })

  test('noops locked versions', () => {
    const newVersions = {
      ...expected,
      'openstax/rex-web (sha)': 'foobar',
      'openstax/rex-web (release id)': 'foobar2'
    }
    const result = setVersions(`asdf
asdf
${exampleBlock}asdf
asdf
`, newVersions)
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (sha): foobar
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1
asdf
asdf
`)
  })

  test('adds versions block if initially unset', () => {
    const result = setVersions(`asdf
asdf
asdf
`, expected)
    expect(result).toEqual(`asdf
asdf
asdf


versions:
- openstax/rex-web (sha): dfde202
- openstax/rex-web (release id): master/dfde202
- openstax/highlights-api (sha): 8575ef7
- openstax/highlights-api (ami): ami-000167d12cf19dce1
`
    )
  })

  test('adds versions to the block', () => {
    const result = setVersions(`asdf
asdf
# versions
- openstax/rex-web (release id): master/dfde202
- openstax/highlights-api (ami): ami-000167d12cf19dce1
asdf
`, expected)
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (sha): dfde202
- openstax/rex-web (release id): master/dfde202
- openstax/highlights-api (sha): 8575ef7
- openstax/highlights-api (ami): ami-000167d12cf19dce1
asdf
`
    )
  })
})

describe('setVersion', () => {
  test('sets version', () => {
    const result = setVersion(`asdf
asdf
${exampleBlock}asdf
asdf
`, 'openstax/rex-web (sha)', 'foobar')
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (sha): foobar
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1
asdf
asdf
`)
  })

  test('adds versions block if initially unset', () => {
    const result = setVersion(`asdf
asdf
asdf
`, 'openstax/rex-web (sha)', 'foobar')
    expect(result).toEqual(`asdf
asdf
asdf


versions:
- openstax/rex-web (sha): foobar
`
    )
  })

  test('adds versions to the block', () => {
    const result = setVersion(`asdf
asdf
# versions
- openstax/rex-web (release id): master/dfde202
- openstax/highlights-api (ami): ami-000167d12cf19dce1
asdf
`, 'openstax/rex-web (sha)', 'foobar')
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (release id): master/dfde202
- openstax/highlights-api (ami): ami-000167d12cf19dce1
- openstax/rex-web (sha): foobar
asdf
`
    )
  })
})
