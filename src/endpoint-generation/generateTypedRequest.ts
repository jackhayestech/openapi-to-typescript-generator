import { ImportCollection } from '../common/ImportCollection'
import { indent, newLine } from '../common/utilities'

export const generateExpressJsTypedRequest = (
	hasPathParameters: boolean,
	hasQueryParameters: boolean,
	hasBody: boolean,
	typedRequestImports: ImportCollection,
): string => {
	if (!hasBody && !hasPathParameters && !hasQueryParameters) return ''

	let comma = false
	let typedRequest = `interface TypedRequest <`
	let typedRequestBody = ''
	let request = `export type Request = TypedRequest<`

	if (hasPathParameters) {
		typedRequestImports.add('Params')
		typedRequest += `P extends Params`
		typedRequestBody += `${indent}params: P${newLine}`
		request += `Parameters['params']`
		comma = true
	}

	if (hasQueryParameters) {
		typedRequestImports.add('Query')
		if (comma) {
			request += ','
			typedRequest += ','
		}
		typedRequest += `Q extends Query`
		typedRequestBody += `${indent}query: Q${newLine}`
		request += `Parameters['query']`
		comma = true
	}

	if (hasBody) {
		typedRequestBody += `${indent}body: B${newLine}`
		if (comma) {
			request += ','
			typedRequest += ','
		}
		typedRequest += `B`
		request += 'RequestBody'
		comma = true
	}

	typedRequest += `> extends Express.Request{${newLine}${typedRequestBody}}${newLine}${newLine}`
	request += '>'

	return `${typedRequest}${request}`
}
