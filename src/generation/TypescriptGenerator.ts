import fs from 'fs'

import { Components } from '../types/component.types'
import { Endpoint, Methods, Paths } from '../types/types'
import { createSchemaFile } from './common/utilities'
import { EndpointGenerator } from './EndpointGenerator'
import { ResponseComponentGenerator } from './ResponseComponentGenerator'
import { SchemaGenerator } from './SchemaGenerator'

export class TypescriptGenerator {
	indexFile: string = ''
	outputFolderName: string
	components: Components

	constructor(paths: Paths, components: Components, output: string) {
		this.outputFolderName = output
		this.components = components

		this.createOutputDirectory()

		const schemaExport = new SchemaGenerator(this.outputFolderName, components.schemas).getExport()
		this.addToIndexFile(schemaExport)

		const responseComponentsExport = new ResponseComponentGenerator(
			this.outputFolderName,
			components.responses,
		).getExport()
		this.addToIndexFile(responseComponentsExport)

		for (const key in paths) {
			this.generatePath(paths[key])
		}

		createSchemaFile(`${output}/index.ts`, this.indexFile)
	}

	addToIndexFile(str: string) {
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
		this.addToIndexFile(ep.exportLine)
	}
}
