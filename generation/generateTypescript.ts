import fs, { writeFile } from 'fs'

import { generateExportLine, generateImportString } from '../common'
import { TypedRequestKeys } from '../types/common.types'
import { Components } from '../types/component.types'
import { Endpoint, Methods, Paths } from '../types/types'
import { generateParameters } from './parameterGeneration'
import { generateRequestBody } from './requestBodyGeneration'
import { generateResponseComponents } from './responseComponentGeneration'
import { generateResponses } from './responseGeneration'
import { generateSchemas } from './schemaGeneration'
import { generateTypedRequest } from './generateTypedRequest'

export const generateTypescript = (paths: Paths, components: Components, output: string) => {
	if (!fs.existsSync(output)) {
		fs.mkdirSync(output)
	}

	let indexFileString = ''

	indexFileString += generateSchemas(output, components.schemas)
	indexFileString += generateResponseComponents(output, components.responses)

	for (const key in paths) {
		indexFileString += generatePath(paths[key], components, output)
	}

	writeFile(`${output}/index.ts`, indexFileString, () => {})
}

const generatePath = (methods: Methods, components: Components, output: string): string => {
	if (methods.get) {
		return generateEndpoint(methods.get, components, output)
	}
	if (methods.post) {
		return generateEndpoint(methods.post, components, output)
	}
	if (methods.delete) {
		return generateEndpoint(methods.delete, components, output)
	}
	if (methods.put) {
		return generateEndpoint(methods.put, components, output)
	}

	return ''
}

const generateEndpoint = (
	{ parameters, requestBody, responses, operationId }: Endpoint,
	components: Components,
	output: string,
): string => {
	if (!operationId) throw new Error('Operation Id required.')

	const componentImports: string[] = []
	const responsesImports: string[] = []
	const typedRequestImports: string[] = []

	const typedRequest: TypedRequestKeys = { body: false, params: false }

	let endpointFile = ''

	if (parameters) {
		endpointFile += generateParameters(componentImports, parameters, components.parameters)
		typedRequest.params = true
	}
	if (requestBody) {
		endpointFile += generateRequestBody(componentImports, requestBody, components)
		typedRequest.body = true
	}

	endpointFile += generateResponses(responsesImports, responses)
	endpointFile += generateTypedRequest(typedRequest, typedRequestImports)

	endpointFile = `${generateImportString(typedRequestImports, 'express-serve-static-core')}${endpointFile}`
	endpointFile = `${generateImportString(componentImports, './schemas.types')}${endpointFile}`
	endpointFile = `${generateImportString(responsesImports, './responses.types')}${endpointFile}`

	writeFile(`${output}/${operationId}.ts`, endpointFile, () => {})
	return generateExportLine(operationId, ` as ${operationId}`)
}
