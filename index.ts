import fs, { writeFile } from 'fs'
import { parse } from 'yaml'

import { generateImportString } from './common'
import { generateParameters } from './generation/parameterGeneration'
import { generateRequestBody } from './generation/requestBodyGeneration'
import { generateSchemas } from './generation/schemaGeneration'
import { Components } from './types/component.types'
import { Endpoint, Methods, Paths } from './types/types'

const generateTypescript = (paths: Paths, components: Components) => {
	generateSchemas(components.schemas)

	for (const key in paths) {
		generatePath(paths[key], components)
	}
}

const generatePath = (methods: Methods, components: any) => {
	if (methods.get) {
		generateEndpoint(methods.get, components)
	}
	if (methods.post) {
		generateEndpoint(methods.post, components)
	}
	if (methods.delete) {
		generateEndpoint(methods.delete, components)
	}
	if (methods.put) {
		generateEndpoint(methods.put, components)
	}
}

const generateEndpoint = ({ parameters, requestBody, responses, operationId }: Endpoint, components: Components) => {
	if (!operationId) throw new Error('Operation Id required.')

	const imports: string[] = []
	let endpointFile = ''

	endpointFile += generateParameters(operationId, imports, parameters, components.parameters)
	endpointFile += generateRequestBody(operationId, imports, requestBody, components)

	endpointFile = `${generateImportString(imports)}${endpointFile}`

	writeFile(`./generated/${operationId}.ts`, endpointFile, () => {})
}

const file = fs.readFileSync('./application.openapi.yaml', 'utf8')
const { paths, components } = parse(file)

generateTypescript(paths, components)
