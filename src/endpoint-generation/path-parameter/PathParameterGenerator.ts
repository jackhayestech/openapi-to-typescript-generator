import { ImportCollection } from '../../common/ImportCollection'
import { capitalizeFirstLetter, getComponentNameFromRef, newLine } from '../../common/utilities'
import { ConvertedParameters, Ref } from '../../types/common.types'
import { ComponentParameters } from '../../types/component.types'
import { PathParameter, PathParameters, isPathParameter } from '../../types/endpoint.types'
import { generateParamTypescript, generateParameterType } from './utilities'

export class ParameterGenerator {
	private convertedParameters: ConvertedParameters = {}
	private schemaImports = new ImportCollection('./schemas.types')
	private parameterSchemas: ComponentParameters

	/**
	 * The imports required for the
	 */
	imports: string[] = []
	/**
	 * The converted path parameter string
	 */
	parametersString = ''

	pathParameter = false
	queryParameter = false

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
				this.generateParameterObject(param)
				this.checkParmType(param)
			} else {
				this.generateParameterFromRef(param)
			}
		})

		this.parametersString += this.generateParameterInterface()
		this.parametersString = `${this.schemaImports.generateImportString()}${this.parametersString}`
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

		this.checkParmType(param)

		if (!this.convertedParameters[param.in]) {
			this.convertedParameters[param.in] = []
		}

		this.convertedParameters[param.in].push({
			required: param.required,
			name: param.name,
			interface: name,
		})
	}

	private generateParameterObject = (param: PathParameter) => {
		if (!this.convertedParameters[param.in]) {
			this.convertedParameters[param.in] = []
		}

		if ('$ref' in param.schema) {
			const name = getComponentNameFromRef(param.schema.$ref as string)
			this.schemaImports.add(name)
		}

		this.convertedParameters[param.in].push({
			required: param.required,
			name: param.name,
			interface: capitalizeFirstLetter(param.name),
		})
	}

	private generateParameterInterface = (): string => {
		let paramString = `interface Parameters {${newLine}`
		for (const key in this.convertedParameters) {
			const paramType = generateParameterType(key, this.convertedParameters[key])
			paramString = `${paramString}${paramType}${newLine}`
		}
		paramString = `${paramString}}${newLine}${newLine}`
		return paramString
	}

	private checkParmType = (param: PathParameter) => {
		if (param.in === 'path') {
			this.pathParameter = true
		}
		if (param.in === 'query') {
			this.queryParameter = true
		}
	}
}
