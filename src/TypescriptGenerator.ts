import fs from 'fs'

import { SchemaGenerator } from './SchemaGenerator'
import { createSchemaFile } from './common/utilities'
import { EndpointGenerator } from './endpoint-generation/EndpointGenerator'
import { ResponseComponentGenerator } from './endpoint-generation/ResponseComponentGenerator'
import { Components } from './types/component.types'
import { Endpoint, Methods, Paths } from './types/endpoint.types'

export class TypescriptGenerator {
	indexFile: string = ''
	outputFolderName: string
	components: Components

	constructor(paths: Paths, components: Components, output: string) {
		this.outputFolderName = output
		this.components = components

		this.createOutputDirectory()

		const schemaGen = new SchemaGenerator(this.outputFolderName, components.schemas)
		this.addExportToIndexFile(schemaGen.getExportString())

		const responseComponentsGen = new ResponseComponentGenerator(this.outputFolderName, components.responses)
		this.addExportToIndexFile(responseComponentsGen.getExportString())

		for (const path in paths) {
			this.generatePath(paths[path])
		}

		createSchemaFile(`${output}/index.ts`, this.indexFile)
	}

	addExportToIndexFile(str: string) {
		this.indexFile += str
	}

	createOutputDirectory() {
		if (!fs.existsSync(this.outputFolderName)) {
			fs.mkdirSync(this.outputFolderName)
		}
	}

	generatePath(methods: Methods) {
		if (methods.get) {
			this.generateEndpoint(methods.get)
		}
		if (methods.post) {
			this.generateEndpoint(methods.post)
		}
		if (methods.delete) {
			this.generateEndpoint(methods.delete)
		}
		if (methods.put) {
			this.generateEndpoint(methods.put)
		}
	}

	generateEndpoint(endpoint: Endpoint) {
		const ep = new EndpointGenerator(this.outputFolderName, this.components, endpoint)
		this.addExportToIndexFile(ep.exportLine)
	}
}
