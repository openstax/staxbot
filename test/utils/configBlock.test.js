import {getBlocks, getItems, getItemValue, setItems, setItem} from '../../src/utils/configBlock.js'

const exampleBlock = `# versions
- openstax/rex-web (sha): dfde202
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1, ami-123 +csv
`

const expected = {
  'openstax/rex-web (sha)': {value: 'dfde202', flags: []},
  'openstax/rex-web (release id)': {value: 'master/dfde202', flags: ['locked']},
  'openstax/highlights-api (sha)': {value: '8575ef7', flags: ['locked']},
  'openstax/highlights-api (ami)': {value: ['ami-000167d12cf19dce1', 'ami-123'], flags: []}
}

const otherExampleBlock = `# configs
- thing1: foo
- thing2: stuff1, stuff2 +csv +asdf
`

const exampleBlocks = `${otherExampleBlock}

${exampleBlock}
`

describe('getBlocks', () => {
  test('finds blocks', () => {
    const result = getBlocks(exampleBlocks)
    expect(result).toEqual([
      {items: {thing1: {value: 'foo', flags: []}, thing2: {value: ['stuff1', 'stuff2'], flags: ['asdf']}}, name: 'configs', body: otherExampleBlock},
      {items: expected, name: 'versions', body: exampleBlock}
    ])
  })
  test('skips invalid blocks', () => {
    const result = getBlocks('   ' + exampleBlocks)
    expect(result).toEqual([
      {items: expected, name: 'versions', body: exampleBlock}
    ])
  })
})

describe('getItems', () => {
  test('resolves basic block', () => {
    const result = getItems(exampleBlock, 'versions')
    expect(result).toEqual(expected)
  })

  test('resolves with text before', () => {
    const result = getItems('asdf\n\rasdf\n\rasdf\n\r' + exampleBlock, 'versions')
    expect(result).toEqual(expected)
  })

  test('doesnt resolve with whitespace before first line', () => {
    const result = getItems('   ' + exampleBlock, 'versions')
    expect(result).toEqual(null)
  })

  test('doesnt resolve with text before first line', () => {
    const result = getItems('asdf' + exampleBlock, 'versions')
    expect(result).toEqual(null)
  })

  test('resolves with text around', () => {
    const result = getItems('asdf\n\rasdf\n\rasdf\n\r' + exampleBlock + 'asdf\n\rasdf\n\rasdf\n\r', 'versions')
    expect(result).toEqual(expected)
  })

  test('resolves with text after', () => {
    const result = getItems(exampleBlock + 'asdf\n\rasdf\n\rasdf\n\r', 'versions')
    expect(result).toEqual(expected)
  })

  test('pipeline title must be on own line', () => {
    const result = getItems('asdf\n\rasdf\n\rasdf' + exampleBlock, 'versions')
    expect(result).toEqual(null)
  })

  test('doesn\'t match different block', () => {
    const result = getItems('adsfasdf: \n- https://github.com/openstax/rex-web/pulls/123', 'versions')
    expect(result).toEqual(null)
  })

  test('doesn\'t match other block earlier in body', () => {
    const result = getItems('asdfasdf: \n- https://github.com/openstax/rex-web/pulls/123\n\radsf\n\r' + exampleBlock, 'versions')
    expect(result).toEqual(expected)
  })
})

describe('getItemValue', () => {
  test('gets version', () => {
    const result = getItemValue(exampleBlock, 'versions', 'openstax/rex-web (release id)')
    expect(result).toEqual('master/dfde202')
  })

  test('returns undefined if not found', () => {
    const result = getItemValue(exampleBlock, 'versions', 'asdfasdf')
    expect(result).toEqual(undefined)
  })
})

describe('setVersions', () => {
  test('sets versions', () => {
    const newVersions = {...expected, 'openstax/rex-web (sha)': {value: 'foobar'}}
    const result = setItems(`asdf
asdf
${exampleBlock}asdf
asdf
`, 'versions', newVersions)
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (sha): foobar
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1, ami-123 +csv
asdf
asdf
`)
  })

  test('updates flags', () => {
    const newVersions = {
      ...expected,
      'openstax/rex-web (sha)': {value: 'foobar'},
      'openstax/rex-web (release id)': {value: 'foobar2', flags: ['locked', 'bam']}
    }
    const result = setItems(`asdf
asdf
${exampleBlock}asdf
asdf
`, 'versions', newVersions)
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (sha): foobar
- openstax/rex-web (release id): foobar2 +locked +bam
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1, ami-123 +csv
asdf
asdf
`)
  })

  test('adds versions block if initially unset', () => {
    const result = setItems(`asdf
asdf
asdf
`, 'versions', expected)
    expect(result).toEqual(`asdf
asdf
asdf


versions:
- openstax/rex-web (sha): dfde202
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1, ami-123 +csv
`
    )
  })

  test('adds versions to the block', () => {
    const result = setItems(`asdf
asdf
# versions
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1, ami-123 +csv
asdf
`, 'versions', expected)
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (sha): dfde202
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1, ami-123 +csv
asdf
`
    )
  })
})

describe('setItem', () => {
  test('sets version', () => {
    const result = setItem(`asdf
asdf
${exampleBlock}asdf
asdf
`, 'versions', 'openstax/rex-web (sha)', 'foobar')
    expect(result).toEqual(`asdf
asdf
# versions
- openstax/rex-web (sha): foobar
- openstax/rex-web (release id): master/dfde202 +locked
- openstax/highlights-api (sha): 8575ef7 +locked
- openstax/highlights-api (ami): ami-000167d12cf19dce1, ami-123 +csv
asdf
asdf
`)
  })

  test('adds versions block if initially unset', () => {
    const result = setItem(`asdf
asdf
asdf
`, 'versions', 'openstax/rex-web (sha)', 'foobar')
    expect(result).toEqual(`asdf
asdf
asdf


versions:
- openstax/rex-web (sha): foobar
`
    )
  })

  test('adds versions to the block', () => {
    const result = setItem(`asdf
asdf
# versions
- openstax/rex-web (release id): master/dfde202
- openstax/highlights-api (ami): ami-000167d12cf19dce1
asdf
`, 'versions', 'openstax/rex-web (sha)', 'foobar')
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
