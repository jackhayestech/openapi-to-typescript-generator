jest.mock('fs', () => ({
	promises: {
		writeFile: jest.fn().mockResolvedValue(''),
		readFile: jest.fn().mockResolvedValue(''),
	},
}))

import { execSync } from 'child_process'
import fs from 'fs'

describe('Tests the full generation using the example open api file', () => {
	it('Should generate the expected files', () => {
		execSync('npm run start -- -i example.openapi.yaml -o ./generated ')

		expect(fs.promises.writeFile).toHaveBeenCalledTimes(1)
	})
})
