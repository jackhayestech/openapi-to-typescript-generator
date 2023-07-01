import { ArraySchema, ObjectSchema, Primitive } from './types/common.types'

export const generateInterface = (name: string, schema: ObjectSchema): string => {
	let interfaceString = `interface ${name}{${newLine}`

	for (const key in schema.properties) {
		let optional = !schema?.required?.includes(key) ? '?' : ''

		if (schema.properties[key].type === 'array') {
			interfaceString += generateArrayInterfaceKey(key, schema.properties[key] as ArraySchema, optional)
		} else {
			interfaceString += generateInterfaceKey(key, schema.properties[key].type, optional)
		}
	}

	interfaceString += `}${newLine}${newLine}`

	return interfaceString
}

export const generateInterfaceKey = (key: string, value: Primitive, optional: string): string =>
	`${indent}${key}${optional}: ${value}${newLine}`

export const generateArrayInterfaceKey = (key: string, { items }: ArraySchema, optional: string): string => {
	let item = ''

	if ('type' in items) {
		item = `${items.type}[]`
	} else if ('$ref' in items) {
		const ref = items.$ref as string
		item += `${getComponentNameFromRef(ref)}[]`
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

export const generateType = (key: string, value: Primitive): string =>
	`type ${capitalizeFirstLetter(key)} = ${value}${newLine}`

export const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

export const getComponentNameFromRef = (ref: string): string => ref.split('/').slice(-1)[0]

export const newLine = '\n'
export const indent = '\t'
