import fs, { writeFile } from 'fs'
import { parse } from 'yaml'

import { generateParameters } from './parameterGeneration'
import { Endpoint, Methods, Paths } from './types'

const generateTypescript = (paths: Paths) => {
	for (const key in paths) {
		generatePath(paths[key])
	}
}

const generatePath = (methods: Methods) => {
	if (methods.get) {
		generateEndpoint(methods.get)
	}
	if (methods.post) {
		generateEndpoint(methods.post)
	}
	if (methods.delete) {
		generateEndpoint(methods.delete)
	}
	if (methods.put) {
		generateEndpoint(methods.put)
	}
}

const generateEndpoint = ({ parameters, requestBody, responses }: Endpoint) => {
	let endpointFile = ''
	endpointFile = generateParameters(endpointFile, parameters)
	// console.log(requestBody)
	// console.log(responses)
	console.log(endpointFile)
	writeFile('./generated/gen.ts', endpointFile, () => {})
}

const file = fs.readFileSync('./application.openapi.yaml', 'utf8')
const {
	paths,
	components: { requestBodies, schemas },
} = parse(file)

generateTypescript(paths)
