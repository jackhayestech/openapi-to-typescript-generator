import { capitalizeFirstLetter, generateImportString, getComponentNameFromRef } from '../common'
import { ConvertedParameters, Ref } from '../types/common.types'
import { ComponentParameters } from '../types/component.types'
import { PathParameters, isPathParameter } from '../types/types'
import { generateParamTypescript, generateParameterInterface, generateParameterObject } from './parameterGeneration'

export class PathParameterGenerator {
	private convertedParameters: ConvertedParameters = {}
	private schemaImports: string[] = []
	private parameterSchemas: ComponentParameters

	/**
	 * The imports required for the
	 */
	imports: string[] = []
	/**
	 * The converted path parameter string
	 */
	parametersString = ''

	constructor(parameters: PathParameters, schemas?: ComponentParameters) {
		if (!schemas) {
			throw new Error('Component params expected')
		}

		this.parameterSchemas = schemas
		this.generateParameters(parameters)
	}

	private generateParameters(parameters: PathParameters) {
		parameters.forEach((param) => {
			if (isPathParameter(param)) {
				this.parametersString += generateParamTypescript(param)
				generateParameterObject(this.convertedParameters, param, this.schemaImports)
			} else {
				this.generateParameterFromRef(param)
			}
		})

		this.parametersString += generateParameterInterface(this.convertedParameters)
		this.parametersString = `${generateImportString(this.schemaImports, './schemas.types')}${this.parametersString}`
	}

	private generateParameterFromRef({ $ref }: Ref) {
		let name = getComponentNameFromRef($ref)
		let unmodifiedName = name

		if (this.parameterSchemas?.[name]) {
			const param = this.parameterSchemas[name]
			name = `${capitalizeFirstLetter(param.name)} as ${unmodifiedName}`
		}

		this.imports.push(name)

		this.generateParameterObjectFromRef(unmodifiedName)
	}

	private generateParameterObjectFromRef = (name: string) => {
		if (!(name in this.parameterSchemas)) {
			throw new Error('Expected param not in component params')
		}

		const param = this.parameterSchemas[name]

		if (!this.convertedParameters[param.in]) {
			this.convertedParameters[param.in] = []
		}

		this.convertedParameters[param.in].push({
			required: param.required,
			name: param.name,
			interface: name,
		})
	}
}
