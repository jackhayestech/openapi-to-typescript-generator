import {
	createSchemaFile,
	generateExportLine,
	generateInterface,
	generateType,
	getComponentNameFromRef,
	newLine,
} from '../common'
import { AllOfSchema, Schema, Schemas } from '../types/common.types'

export class SchemaGeneration {
	output: string
	fileString = ''
	fileName = 'schemas.types'

	constructor(output: string, schemas?: Schemas) {
		this.output = output
		this.generate(schemas)
	}

	private generate(schemas?: Schemas) {
		if (!schemas) ''

		for (const key in schemas) {
			this.generateSchema(key, schemas[key])
		}

		createSchemaFile(`${this.output}/${this.fileName}.ts`, this.fileString)
	}

	private generateSchema(name: string, schema: Schema) {
		if ('allOf' in schema) {
			this.allOfSchemaGenerate(name, schema)
			return
		}

		if (!('type' in schema)) {
			throw new Error('Should not have gotten here')
		}

		switch (schema.type) {
			case 'object':
				this.fileString += `export ${generateInterface(name, schema)}`
				return
			case 'number':
			case 'string':
				this.fileString += `export ${generateType(name, schema.type)}`
				return
			case 'array':
				throw new Error('need to support array')
		}
	}

	allOfSchemaGenerate = (name: string, { allOf }: AllOfSchema) => {
		let schemaString = `export type ${name} = `

		allOf.forEach(({ $ref }, i) => {
			if ($ref) {
				schemaString += `${getComponentNameFromRef($ref)}`
				if (i !== allOf.length - 1) {
					schemaString += ' | '
				}
			} else {
				throw new Error('Inline interface not supported for all of')
			}
		})

		schemaString += `${newLine}${newLine}`

		this.fileString += schemaString
	}

	getExport() {
		return generateExportLine(this.fileName)
	}
}
