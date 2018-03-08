import path from 'path'
import shell from 'shelljs'
import fs from 'fs'
import gettextParser from 'gettext-parser'
import jsonfile from 'jsonfile'

export default function (domainName, config, potPath) {
    const baseLocale = config.get('base-locale')
    const targetDir = config.get('target-dir')

    const translations = {}

    const baseJsonFile = path.join(targetDir, baseLocale + '.json')
    const baseJson = jsonfile.readFileSync(baseJsonFile)
    for (const [ns, entries] of Object.entries(baseJson)) {
        for (const [key, value] of Object.entries(entries)) {
            const context = ns + '.' + key
            translations[context] = {
                [value]: {
                    msgctxt: context,
                    msgid: value,
                    msgstr: ''
                }
            }
        }
    }

    const output = gettextParser.po.compile({
        charset: 'UTF-8',
        headers: {
            'Project-Id-Version': domainName,
            'Language': '',
            'MIME-Version': '1.0',
            'Content-Type': 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding': '8bit'
        },
        translations: translations
    })

    shell.mkdir('-p', path.dirname(potPath))
    fs.writeFileSync(potPath, output)
}
