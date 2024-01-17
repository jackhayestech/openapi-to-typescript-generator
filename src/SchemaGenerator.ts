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

export interface ExternalFileImports {
	name: string
	ref: string
	fileName?: string
}

export class SchemaGenerator {
	output: string
	fileLocation: string
	fileString = ''
	fileName = 'schemas.types'
	externalFileImports: ExternalFileImports[] = []

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
			const { fileName, data } = this.getSchemaFromExternalFile(e.ref, e.fileName)
			const path = e.fileName ?? fileName
			this.generateSchema(getComponentNameFromRef(e.ref), data, path)
			i++
		}
		createSchemaFile(`${this.output}/${this.fileName}.ts`, this.fileString)
	}

	private generateSchema(name: string, schema: Schema, fileName?: string) {
		let externalFileName: string | undefined = fileName

		// Import from other file
		if ('$ref' in schema) {
			const { data, fileName } = this.getSchemaFromExternalFile(schema.$ref as string)
			externalFileName = fileName
			schema = data
		}

		if ('allOf' in schema) {
			this.fileString += this.allOfSchemaGenerate(name, schema, externalFileName)
			return
		}

		if (!('type' in schema)) {
			throw new Error('Should not have gotten here')
		}

		switch (schema.type) {
			case 'object':
				const interfaceGen = new InterfaceGenerator(name, schema, { filePath: externalFileName })
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
				const arrayGen = new InterfaceGenerator(name, schema, { filePath: externalFileName })
				this.fileString += `export ${arrayGen.interface}`
				this.addToExternals(arrayGen.externalFileImports)
				return
		}
	}

	addToExternals = (newImports: ExternalFileImports[]) => {
		newImports.map((nI) => {
			if (!this.externalFileImports.find(({ name }) => name === nI.name)) {
				this.externalFileImports.push(nI)
			}
		})
	}

	allOfSchemaGenerate = (name: string, { allOf }: AllOfSchema, fileName?: string): string => {
		if (allOf.some(({ $ref }) => !$ref)) {
			if (allOf.length !== 2) {
				throw Error('All of extends type should only have two elements')
			}
			const ref = allOf.find(({ $ref }) => $ref !== undefined) as Ref
			const obj = allOf.find(({ $ref }) => !$ref) as ObjectSchema
			return this.allOfExtends(name, ref.$ref, obj, fileName)
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

	allOfExtends = (name: string, ref: string, obj: ObjectSchema, fileName?: string): string => {
		const refName = getComponentNameFromRef(ref)

		if (ref[0] !== '#') {
			this.addToExternals([{ name: refName, ref, fileName }])
		}

		let schemaString = `export interface ${name} extends ${refName} {${newLine}`

		const interfaceGen = new InterfaceGenerator(name, obj, { filePath: fileName })
		schemaString += interfaceGen.generateObjectInterface(obj)
		schemaString += `}${newLine}${newLine}`

		this.addToExternals(interfaceGen.externalFileImports)

		return schemaString
	}

	getSchemaFromExternalFile = (ref: string, path?: string) => {
		const splitString = ref.split('#')
		const fileName = splitString[0]

		let location = this.fileLocation

		// Path was provided and isn't a relative path
		if (path && path[0] === '.') {
			location = `${this.fileLocation}/${path}`
		} else {
			location = `${location}/${fileName}`
		}

		let file
		try {
			file = fs.readFileSync(location, 'utf8')
		} catch (error) {
			throw `File not found: ref: ${ref} path: ${path}`
		}

		let data = parse(file)
		let current
		const componentPath = splitString[1].split('/').filter((s) => s != '')
		for (let i = 0; i < componentPath.length; i++) {
			current = componentPath[i]
			data = data[current]
		}
		return { data, fileName }
	}
}
