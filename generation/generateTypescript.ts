import fs, { writeFile } from 'fs'

import { generateExportLine, generateImportString } from '../common'
import { Components } from '../types/component.types'
import { Endpoint, Methods, Paths } from '../types/types'
import { generateParameters } from './parameterGeneration'
import { generateRequestBody } from './requestBodyGeneration'
import { generateResponseComponents } from './responseComponentGeneration'
import { generateResponses } from './responseGeneration'
import { generateSchemas } from './schemaGeneration'

const path = 'generated'

export const generateTypescript = (paths: Paths, components: Components) => {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path)
	}

	let indexFileString = ''

	indexFileString += generateSchemas(components.schemas)
	indexFileString += generateResponseComponents(components.responses)

	for (const key in paths) {
		indexFileString += generatePath(paths[key], components)
	}

	writeFile(`./${path}/index.ts`, indexFileString, () => {})
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

	writeFile(`./${path}/${operationId}.ts`, endpointFile, () => {})
	return generateExportLine(operationId, ` as ${operationId}Request`)
}
