import { ExternalFileImports } from '../SchemaGenerator'
import { AnyOf, ArraySchema, ObjectSchema } from '../types/common.types'
import { ImportCollection } from './ImportCollection'
import { generateInterfaceKey, getComponentNameFromRef, indent, newLine } from './utilities'

export class InterfaceGenerator {
	name: string
	schema: ObjectSchema | ArraySchema
	imports: ImportCollection
	externalFileImports: ExternalFileImports[] = []
	filePath: string | undefined

	interface = ''

	constructor(
		name: string,
		schema: ObjectSchema | ArraySchema,
		optionals?: { filePath?: string; imports?: ImportCollection },
	) {
		this.name = name
		this.schema = schema
		this.imports = optionals?.imports ?? new ImportCollection('')
		this.filePath = optionals?.filePath

		this.generateInterface()
	}

	generateInterface = () => {
		let interfaceString = ''

		if (this.schema.type === 'object') {
			interfaceString = `interface ${this.name} {${newLine}`
			interfaceString += this.generateObjectInterface(this.schema)
			interfaceString += `}`
		} else if (this.schema.type === 'array') {
			interfaceString = `type ${this.name} = `
			interfaceString += this.generateArrayInterfaceKey(this.name, this.schema as ArraySchema)
		}
		interfaceString += `${newLine}${newLine}`
		this.interface = interfaceString
	}

	generateObjectInterface = (schema: ObjectSchema) => {
		let interfaceString = ''
		for (const key in schema.properties) {
			let optional = !schema?.required?.includes(key) ? '?' : ''
			let properties = schema.properties[key]

			if (schema.properties[key].type === 'array') {
				interfaceString += `${indent}${key}${optional}: ${this.generateArrayInterfaceKey(
					key,
					properties as ArraySchema,
					optional,
				)}`
			} else if (schema.properties[key].type === 'object') {
				interfaceString += this.generateObjectInterfaceKey(key, properties as ObjectSchema, optional)
			} else if ('$ref' in properties) {
				const ref = this.createFromRef(properties['$ref'] as string)
				interfaceString += `${indent}${key}: ${ref}${newLine}`
			} else {
				interfaceString += generateInterfaceKey(key, properties.type, optional)
			}
		}

		return interfaceString
	}

	generateArrayInterface = (interfaceString: string, schema: ArraySchema) => {
		let properties = schema

		interfaceString += this.generateArrayInterfaceKey(this.name, properties as ArraySchema)

		return interfaceString
	}

	generateArrayInterfaceKey = (key: string, { items }: ArraySchema, optional: string = ''): string => {
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

		return `${item}${newLine}`
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
		if (ref[0] !== '#') {
			this.externalFileImports.push({ ref, fileName: this.filePath })
		}
		const value = getComponentNameFromRef(ref)
		this.imports.add(value)

		return value
	}

	createAnyOf = (anyOf: AnyOf[]) => {
		let item = '('

		anyOf.forEach((type, i) => {
			if ('$ref' in type) {
				item += getComponentNameFromRef(type.$ref)
			} else {
				item += type.type
			}
			if (i !== anyOf.length - 1) {
				item += ' | '
			}
		})

		item += `)[]`
		return item
	}
}
