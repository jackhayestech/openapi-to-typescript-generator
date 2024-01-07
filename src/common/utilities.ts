import { writeFile } from 'fs'
import { Primitive, PrimitiveSchema } from '../types/common.types'

export const generateInterfaceKey = (key: string, value: Primitive, optional: string): string =>
	`${indent}${key}${optional}: ${value}${newLine}`

export const generateType = (key: string, value: Primitive): string =>
	`type ${capitalizeFirstLetter(key)} = ${value}${newLine}`

export const generateEnumString = (key: string, schema: PrimitiveSchema): string => {
	let enums = ''
	schema.enum?.map((s, i) => {
		enums += `'${s}'`
		if (i !== schema.enum!.length - 1) {
			enums += ' | '
		}
	})
	return `type ${capitalizeFirstLetter(key)} = ${enums}${newLine}`
}

export const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

export const lowercaseFirstLetter = (string: string) => string.charAt(0).toLocaleLowerCase() + string.slice(1)

export const getComponentNameFromRef = (ref: string): string => ref.split('/').slice(-1)[0]

export const generateExportString = (fileName: string, asString = '') =>
	`export * ${asString} from './${fileName}'${newLine}`

export const newLine = '\n'
export const indent = '\t'

export const createSchemaFile = (fileName: string, fileString: string) => {
	writeFile(fileName, fileString, (error) => {
		if (error) console.log(error)
	})
}

export const filterDuplicates = (strings: string[]): string[] => Array.from(new Set(strings))
