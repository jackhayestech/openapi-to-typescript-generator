import { newLine } from './utilities'

export class ImportCollection {
	filePath: string
	imports: string[] = []

	constructor(filePath: string) {
		this.filePath = filePath
	}

	add = (newImport: string) => {
		if (this.imports.includes(newImport)) return

		this.imports.push(newImport)
	}

	addMany = (newImports: string[]) =>
		newImports.forEach((newImport) => {
			if (this.imports.includes(newImport)) return

			this.imports.push(newImport)
		})

	generateImportString = (): string => {
		if (this.imports.length === 0) return ''

		let importString = 'import {'

		this.imports.forEach((imp, i) => {
			importString += ` ${imp}`
			if (i !== this.imports.length - 1) {
				importString += ','
			}
		})

		importString += ` } from '${this.filePath}'${newLine}${newLine}`

		return importString
	}
}
