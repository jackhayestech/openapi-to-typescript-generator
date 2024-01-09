import fs from 'fs'
import { parse } from 'yaml'
import { InterfaceGenerator } from './common/InterfaceGenerator'
import {
	createSchemaFile,
	generateEnumString,
	generateExportString,
	generateType,
	getComponentNameFromRef,
	newLine,
} from './common/utilities'
import { AllOfSchema, ObjectSchema, Ref, Schema, Schemas } from './types/common.types'

export class SchemaGenerator {
	output: string
	fileLocation: string
	fileString = ''
	fileName = 'schemas.types'
	externalFileImports: string[] = []

	constructor(output: string, fileLocation: string, schemas?: Schemas) {
		this.output = output
		this.fileLocation = fileLocation
		this.generate(schemas)
	}

	private generate(schemas?: Schemas) {
		if (!schemas) ''

		for (const key in schemas) {
			this.generateSchema(key, schemas[key])
		}

		let i = 0

		while (i < this.externalFileImports.length) {
			const e = this.externalFileImports[i]
			this.generateSchema(getComponentNameFromRef(e), this.getSchemaFromExternalFile(e))
			i++
		}
		createSchemaFile(`${this.output}/${this.fileName}.ts`, this.fileString)
	}

	private generateSchema(name: string, schema: Schema) {
		// Import from other file
		if ('$ref' in schema) {
			schema = this.getSchemaFromExternalFile(schema.$ref as string)
		}

		if ('allOf' in schema) {
			this.fileString += this.allOfSchemaGenerate(name, schema)
			return
		}

		if (!('type' in schema)) {
			throw new Error('Should not have gotten here')
		}

		switch (schema.type) {
			case 'object':
				const interfaceGen = new InterfaceGenerator(name, schema)
				this.fileString += `export ${interfaceGen.interface}`
				this.addToExternals(interfaceGen.externalFileImports)
				return
			case 'number':
			case 'string':
				if (schema.type === 'string' && schema.enum) {
					this.fileString += `export ${generateEnumString(name, schema)}${newLine}`
					return
				}
				this.fileString += `export ${generateType(name, schema.type)}`
				return
			case 'array':
				const arrayGen = new InterfaceGenerator(name, schema)
				this.fileString += `export ${arrayGen.interface}`
				this.addToExternals(arrayGen.externalFileImports)
				return
		}
	}

	addToExternals = (newImports: string[]) => {
		newImports.map((nI) => {
			if (!this.externalFileImports.includes(nI)) {
				this.externalFileImports.push(nI)
			}
		})
	}

	allOfSchemaGenerate = (name: string, { allOf }: AllOfSchema): string => {
		if (allOf.some(({ $ref }) => !$ref)) {
			if (allOf.length !== 2) {
				throw Error('All of extends type should only have two elements')
			}
			const ref = allOf.find(({ $ref }) => $ref !== undefined) as Ref
			const obj = allOf.find(({ $ref }) => !$ref) as ObjectSchema
			return this.allOfExtends(name, ref.$ref, obj)
		}

		let schemaString = `export type ${name} = `

		allOf.forEach(({ $ref }, i) => {
			if ($ref) {
				schemaString += getComponentNameFromRef($ref)
				if (i !== allOf.length - 1) {
					schemaString += ' | '
				}
			} else {
				throw Error('TODO allOfSchemaGenerate')
			}
		})

		schemaString += `${newLine}${newLine}`

		return schemaString
	}

	getExportString() {
		return generateExportString(this.fileName)
	}

	allOfExtends = (name: string, ref: string, obj: ObjectSchema): string => {
		const refName = getComponentNameFromRef(ref)
		let schemaString = `export interface ${name} extends ${refName} {${newLine}`

		const interfaceGen = new InterfaceGenerator(name, obj)
		schemaString += interfaceGen.generateObjectInterface(obj)
		schemaString += `}${newLine}${newLine}`

		return schemaString
	}

	getSchemaFromExternalFile = (ref: string) => {
		const splitString = ref.split('#')
		const fileName = splitString[0]
		const componentPath = splitString[1].split('/').filter((s) => s != '')

		const file = fs.readFileSync(`${this.fileLocation}/${fileName}`, 'utf8')
		let data = parse(file)
		let current
		for (let i = 0; i < componentPath.length; i++) {
			current = componentPath[i]
			data = data[current]
		}
		return data
	}
}
