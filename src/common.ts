import { writeFile } from 'fs'
import { Primitive } from './types/common.types'

export const generateInterfaceKey = (key: string, value: Primitive, optional: string): string =>
	`${indent}${key}${optional}: ${value}${newLine}`

export const generateType = (key: string, value: Primitive): string =>
	`type ${capitalizeFirstLetter(key)} = ${value}${newLine}`

export const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

export const getComponentNameFromRef = (ref: string): string => ref.split('/').slice(-1)[0]

export const generateImportString = (imports: string[], fileName: string): string => {
	if (imports.length === 0) return ''

	let importString = 'import {'

	imports.forEach((imp, i) => {
		importString += ` ${imp}`
		if (i !== imports.length - 1) {
			importString += ','
		}
	})

	importString += ` } from '${fileName}'${newLine}${newLine}`

	return importString
}

export const generateExportLine = (fileName: string, asString = '') =>
	`export * ${asString} from './${fileName}'${newLine}`

export const newLine = '\n'
export const indent = '\t'

export const createSchemaFile = (fileName: string, fileString: string) => {
	writeFile(fileName, fileString, (error) => {
		if (error) console.log(error)
	})
}
