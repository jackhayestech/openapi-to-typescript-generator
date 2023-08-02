import fs from 'fs'

import { TypescriptGenerator } from '../TypescriptGenerator'
import { components, paths } from '../test-data/input'
import {
	createEventFile,
	getEventFile,
	getUserEventsFile,
	indexFile,
	responsesFile,
	schemaFile,
} from '../test-data/output'

describe('Tests the full generation using the example open api file', () => {
	it('Should generate the expected files', () => {
		const output = 'output'
		let fileString: { name: string; fs: string }[] = []

		const writeSpy = jest
			.spyOn(fs, 'writeFile')
			.mockImplementation((dir: any, fs: any, func: any) => fileString.push({ name: dir, fs: fs.trim() }))
		const mkDirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation()

		new TypescriptGenerator(paths, components, output)

		expect(mkDirSpy).toHaveBeenCalledWith(output)
		expect(writeSpy).toHaveBeenCalledTimes(6)

		expect(fileString[0].name).toEqual(`${output}/schemas.types.ts`)
		expect(fileString[0].fs).toEqual(schemaFile.trim())
		expect(fileString[1].name).toEqual(`${output}/responses.types.ts`)
		expect(fileString[1].fs).toEqual(responsesFile.trim())
		expect(fileString[2].name).toEqual(`${output}/CreateEvent.ts`)
		expect(fileString[2].fs).toEqual(createEventFile.trim())
		expect(fileString[3].name).toEqual(`${output}/GetEvent.ts`)
		expect(fileString[3].fs).toEqual(getEventFile.trim())
		expect(fileString[4].name).toEqual(`${output}/GetUserEvents.ts`)
		expect(fileString[4].fs).toEqual(getUserEventsFile.trim())
		expect(fileString[5].name).toEqual(`${output}/index.ts`)
		expect(fileString[5].fs).toEqual(indexFile.trim())
	})
})
