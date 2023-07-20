import fs from 'fs'

import { createSchemaFile } from '../common'
import { Components } from '../types/component.types'
import { Endpoint, Methods, Paths } from '../types/types'
import { GenerateEndpoint } from './generateEndpoint'
import { generateResponseComponents } from './responseComponentGeneration'
import { generateSchemas } from './schemaGeneration'

export class GenerateTypescript {
	indexFile: string = ''
	outputFolderName: string
	components: Components

	constructor(paths: Paths, components: Components, output: string) {
		this.outputFolderName = output
		this.components = components

		this.createOutputDirectory()

		this.addToIndexFile(generateSchemas(this.outputFolderName, components.schemas))
		this.addToIndexFile(generateResponseComponents(this.outputFolderName, components.responses))

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
		const ep = new GenerateEndpoint(this.outputFolderName, this.components, endpoint)
		this.addToIndexFile(ep.getExportLine())
	}
}
