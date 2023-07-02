import { ArraySchema, ObjectSchema, Primitive } from './types/common.types'

export const generateInterface = (name: string, schema: ObjectSchema, imports?: string[]): string => {
	let interfaceString = `interface ${name} {${newLine}`

	for (const key in schema.properties) {
		let optional = !schema?.required?.includes(key) ? '?' : ''

		if (schema.properties[key].type === 'array') {
			interfaceString += generateArrayInterfaceKey(key, schema.properties[key] as ArraySchema, optional, imports)
		} else if (schema.properties[key].type === 'object') {
			interfaceString += generateObjectInterfaceKey(key, schema.properties[key] as ObjectSchema, optional, imports)
		} else {
			interfaceString += generateInterfaceKey(key, schema.properties[key].type, optional)
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
		if (imports) {
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
		if (imports) {
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
	let importString = 'import {'

	imports.forEach((imp, i) => {
		importString += ` ${imp}`
		if (i !== imports.length - 1) {
			importString += ','
		}
	})

	importString += ` } from './${fileName}.types'${newLine}${newLine}`

	return importString
}

export const generateExportLine = (fileName: string, asString = '') =>
	`export * ${asString} from './${fileName}'${newLine}`

export const newLine = '\n'
export const indent = '\t'
