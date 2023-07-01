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

export const generateArrayInterfaceKey = (key: string, schema: ArraySchema, optional: string): string => {
	let items = ''

	if ('type' in schema.items) {
		items = `${schema.items.type}[]`
	} else {
		const anyOf = schema.items.anyOf
		anyOf.forEach((type, i) => {
			items += ` ${type.type}[]`
			if (i !== anyOf.length - 1) {
				items += ' | '
			}
		})
	}

	return `${indent}${key}${optional}: ${items}${newLine}`
}

export const generateType = (key: string, value: Primitive): string =>
	`type ${capitalizeFirstLetter(key)} = ${value}${newLine}`

export const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

export const getComponentNameFromRef = (ref: string): string => ref.split('/').slice(-1)[0]

export const newLine = '\n'
export const indent = '\t'
