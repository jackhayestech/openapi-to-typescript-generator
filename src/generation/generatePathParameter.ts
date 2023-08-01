import { capitalizeFirstLetter, generateImportString, getComponentNameFromRef } from '../common'
import { ConvertedParameters, Ref } from '../types/common.types'
import { Components } from '../types/component.types'
import { PathParameters } from '../types/types'
import {
	generateParamTypescript,
	generateParameterInterface,
	generateParameterObject,
	generateParameterObjectFromRef,
} from './parameterGeneration'

export class PathParameterGenerator {
	convertedParameters: ConvertedParameters = {}
	schemaImports: string[] = []
	localImports: string[] = []
	parameterSchemas: Components['parameters']
	fileString = ''

	constructor(schemas: Components['parameters']) {
		this.parameterSchemas = schemas
	}

	private generateParameters(parameters: PathParameters) {
		let fileString = ''

		parameters.forEach((param) => {
			if ('in' in param) {
				fileString += generateParamTypescript(param)
				generateParameterObject(this.convertedParameters, param, this.schemaImports)
			} else {
				this.generateParameterFromRef(param)
			}
		})

		fileString += generateParameterInterface(this.convertedParameters)
		fileString = `${generateImportString(this.schemaImports, './schemas.types')}${fileString}`

		this.fileString = fileString
	}

	private generateParameterFromRef({ $ref }: Ref) {
		let name = getComponentNameFromRef($ref)
		let unmodifiedName = name

		if (this.parameterSchemas?.[name]) {
			const param = this.parameterSchemas[name]
			name = `${capitalizeFirstLetter(param.name)} as ${unmodifiedName}`
		}

		this.localImports.push(name)

		generateParameterObjectFromRef(this.convertedParameters, unmodifiedName, this.parameterSchemas)
	}
}
