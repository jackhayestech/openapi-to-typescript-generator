import { writeFile } from 'fs'
import { ImportCollection } from './generation/importCollection'
import { ArraySchema, ObjectSchema, Primitive } from './types/common.types'

export const generateInterface = (name: string, schema: ObjectSchema, imports?: ImportCollection): string => {
	let interfaceString = `interface ${name} {${newLine}`

	for (const key in schema.properties) {
		let optional = !schema?.required?.includes(key) ? '?' : ''
		let properties = schema.properties[key]

		if (schema.properties[key].type === 'array') {
			interfaceString += generateArrayInterfaceKey(key, properties as ArraySchema, optional, imports?.imports)
		} else if (schema.properties[key].type === 'object') {
			interfaceString += generateObjectInterfaceKey(key, properties as ObjectSchema, optional, imports?.imports)
		} else {
			interfaceString += generateInterfaceKey(key, properties.type, optional)
		}
	}

	interfaceString += `}${newLine}${newLine}`

	return interfaceString
}

export const generateInterfaceKey = (key: string, value: Primitive, optional: string): string =>
	`${indent}${key}${optional}: ${value}${newLine}`

export const generateArrayInterfaceKey = (
	key: string,
	{ items }: ArraySchema,
	optional: string,
	imports?: string[],
): string => {
	let item = ''

	if ('type' in items) {
		item = `${items.type}[]`
	} else if ('$ref' in items) {
		const ref = items.$ref as string
		const name = getComponentNameFromRef(ref)
		item += `${name}[]`
		if (imports && !imports.includes(name)) {
			imports.push(name)
		}
	} else if ('anyOf' in items) {
		const anyOf = items.anyOf
		anyOf.forEach((type, i) => {
			item += ` ${type.type}[]`
			if (i !== anyOf.length - 1) {
				item += ' | '
			}
		})
	} else {
		throw new Error('Array type not supported')
	}

	return `${indent}${key}${optional}: ${item}${newLine}`
}

export const generateObjectInterfaceKey = (key: string, schema: ObjectSchema, optional: string, imports?: string[]) => {
	let value = ''

	if (schema?.$ref) {
		const ref = schema.$ref as string
		value = getComponentNameFromRef(ref)
		if (imports && !imports.includes(value)) {
			imports.push(value)
		}
	} else if (!schema.$ref && !schema.properties && schema.type === 'object') {
		value = 'any'
	}

	return `${indent}${key}${optional}: ${value}${newLine}`
}

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
