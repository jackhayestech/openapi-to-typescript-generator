import { AnyOf, ArraySchema, ObjectSchema } from '../types/common.types'
import { ImportCollection } from './ImportCollection'
import { generateInterfaceKey, getComponentNameFromRef, indent, newLine } from './utilities'

export class InterfaceGenerator {
	name: string
	schema: ObjectSchema
	imports: ImportCollection

	interface = ''

	constructor(name: string, schema: ObjectSchema, imports?: ImportCollection) {
		this.name = name
		this.schema = schema
		this.imports = imports ?? new ImportCollection('')

		this.generateInterface()
	}

	generateInterface = () => {
		let interfaceString = `interface ${this.name} {${newLine}`

		interfaceString = this.generateObjectInterface(interfaceString)

		interfaceString += `}${newLine}${newLine}`

		this.interface = interfaceString
	}

	generateObjectInterface = (interfaceString: string) => {
		for (const key in this.schema.properties) {
			let optional = !this.schema?.required?.includes(key) ? '?' : ''
			let properties = this.schema.properties[key]

			if (this.schema.properties[key].type === 'array') {
				interfaceString += this.generateArrayInterfaceKey(key, properties as ArraySchema, optional)
			} else if (this.schema.properties[key].type === 'object') {
				interfaceString += this.generateObjectInterfaceKey(key, properties as ObjectSchema, optional)
			} else {
				interfaceString += generateInterfaceKey(key, properties.type, optional)
			}
		}

		return interfaceString
	}

	generateArrayInterfaceKey = (key: string, { items }: ArraySchema, optional: string): string => {
		let item = ''

		if ('type' in items) {
			item = `${items.type}[]`
		} else if ('$ref' in items) {
			item = `${this.createFromRef(items.$ref as string)}[]`
		} else if ('anyOf' in items) {
			item = this.createAnyOf(items.anyOf)
		} else {
			throw new Error('Array type not supported')
		}

		return `${indent}${key}${optional}: ${item}${newLine}`
	}

	generateObjectInterfaceKey = (key: string, schema: ObjectSchema, optional: string) => {
		let value = ''

		if (schema?.$ref) {
			value = this.createFromRef(schema.$ref as string)
		} else if (!schema.$ref && !schema.properties && schema.type === 'object') {
			value = 'any'
		}

		return `${indent}${key}${optional}: ${value}${newLine}`
	}

	createFromRef = (ref: string) => {
		const value = getComponentNameFromRef(ref)
		this.imports.add(value)

		return value
	}

	createAnyOf = (anyOf: AnyOf[]) => {
		let item = ''

		anyOf.forEach((type, i) => {
			item += ` ${type.type}[]`
			if (i !== anyOf.length - 1) {
				item += ' | '
			}
		})

		return item
	}
}
