import fs, { writeFile } from 'fs'
import { parse } from 'yaml'

import { generateExportLine, generateImportString } from './common'
import { generateParameters } from './generation/parameterGeneration'
import { generateRequestBody } from './generation/requestBodyGeneration'
import { generateResponseComponents } from './generation/responseComponentGeneration'
import { generateResponses } from './generation/responseGeneration'
import { generateSchemas } from './generation/schemaGeneration'
import { Components } from './types/component.types'
import { Endpoint, Methods, Paths } from './types/types'

const generateTypescript = (paths: Paths, components: Components) => {
	let indexFileString = ''

	indexFileString += generateSchemas(components.schemas)
	indexFileString += generateResponseComponents(components.responses)

	for (const key in paths) {
		indexFileString += generatePath(paths[key], components)
	}

	writeFile('./generated/index.ts', indexFileString, () => {})
}

const generatePath = (methods: Methods, components: Components): string => {
	if (methods.get) {
		return generateEndpoint(methods.get, components)
	}
	if (methods.post) {
		return generateEndpoint(methods.post, components)
	}
	if (methods.delete) {
		return generateEndpoint(methods.delete, components)
	}
	if (methods.put) {
		return generateEndpoint(methods.put, components)
	}

	return ''
}

const generateEndpoint = (
	{ parameters, requestBody, responses, operationId }: Endpoint,
	components: Components,
): string => {
	if (!operationId) throw new Error('Operation Id required.')

	const componentImports: string[] = []
	const responsesImports: string[] = []

	let endpointFile = ''

	endpointFile += generateParameters(operationId, componentImports, parameters, components.parameters)
	endpointFile += generateRequestBody(operationId, componentImports, requestBody, components)
	endpointFile += generateResponses(responsesImports, responses)

	endpointFile = `${generateImportString(componentImports, 'schemas')}${endpointFile}`
	endpointFile = `${generateImportString(responsesImports, 'responses')}${endpointFile}`

	const path = './generated'
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path)
	}
	writeFile(`${path}/${operationId}.ts`, endpointFile, () => {})
	return generateExportLine(operationId, ` as ${operationId}Request`)
}

const file = fs.readFileSync('./application.openapi.yaml', 'utf8')
const { paths, components } = parse(file)

generateTypescript(paths, components)
