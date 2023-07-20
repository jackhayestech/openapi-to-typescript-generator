import {
	createSchemaFile,
	generateExportLine,
	generateInterface,
	generateType,
	getComponentNameFromRef,
	newLine,
} from '../common'
import { AllOfSchema, Schema } from '../types/common.types'

const fileName = 'schemas.types'

export const generateSchemas = (output: string, schemas?: { [key: string]: Schema }): string => {
	if (!schemas) ''

	let fileString = ''
	let schema

	for (const key in schemas) {
		schema = generateSchema(key, schemas[key])
		if (schema) {
			fileString += schema
		}
	}

	createSchemaFile(`${output}/${fileName}.ts`, fileString)

	return generateExportLine(fileName)
}

const generateSchema = (name: string, schema: Schema): string => {
	if ('allOf' in schema) {
		return allOfSchemaGenerate(name, schema)
	}

	if (!('type' in schema)) {
		throw new Error('Should not have gotten here')
	}

	switch (schema.type) {
		case 'object':
			return `export ${generateInterface(name, schema)}`
		case 'number':
		case 'string':
			return `export ${generateType(name, schema.type)}`
		case 'array':
			throw new Error('need to support array')
	}
}

const allOfSchemaGenerate = (name: string, { allOf }: AllOfSchema): string => {
	let schemaString = `export type ${name} = `

	allOf.forEach((ref, i) => {
		if ('$ref' in ref) {
			schemaString += `${getComponentNameFromRef(ref.$ref)}`
			if (i !== allOf.length - 1) {
				schemaString += ' | '
			}
		} else {
			throw new Error('Inline interface not supported for all of')
		}
	})

	schemaString += `${newLine}${newLine}`

	return schemaString
}
