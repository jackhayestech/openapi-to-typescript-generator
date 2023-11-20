export const schemaFile = `export interface ServerError {
	id?: string
	code?: string
	status?: number
	title?: string
	detail?: string
	meta?: any
}

export interface CreateEventData {
	name: string
	dateTime?: string
	location?: string
	description?: string
}

export interface EventDbData {
	uuid: string
	owners: UserUuid[]
}

export type Event = CreateEventData | EventDbData

export type UserUuid = string
export type EventUuid = string
`
export const responsesFile = `import { ServerError, Event } from './schemas.types'

export interface ServerErrorResponse {
	errors?: ServerError[]
}

export interface SingleEventResponse {
	data?: Event
}

export interface MultipleEventResponse {
	data?: Event[]
}`

export const createEventFile = `import { SingleEventResponse, ServerErrorResponse } from './responses.types'

import { UserUuid as QueryUserUuid, CreateEventData } from './schemas.types'

import { Query } from 'express-serve-static-core'

interface Parameters {
	query: {
		userUuid: QueryUserUuid
	}
}

interface RequestBody {
	data: CreateEventData
}

export interface Responses {
	200: SingleEventResponse
	default: ServerErrorResponse
}

interface TypedRequest <Q extends Query,B> extends Express.Request{
	query: Q
	body: B
}

export type Request = TypedRequest<Parameters['query'],RequestBody>`

export const getEventFile = `import { SingleEventResponse, ServerErrorResponse } from './responses.types'

import { EventUuid as EventUuid } from './schemas.types'

import { Params } from 'express-serve-static-core'

interface Parameters {
	params: {
		eventUuid: EventUuid
	}
}

export interface Responses {
	200: SingleEventResponse
	default: ServerErrorResponse
}

interface TypedRequest <P extends Params> extends Express.Request{
	params: P
}

export type Request = TypedRequest<Parameters['params']>`

export const getUserEventsFile = `import { MultipleEventResponse, ServerErrorResponse } from './responses.types'

import { UserUuid as PathUserUuid } from './schemas.types'

import { Params } from 'express-serve-static-core'

interface Parameters {
	params: {
		userUuid: PathUserUuid
	}
}

export interface Responses {
	200: MultipleEventResponse
	default: ServerErrorResponse
}

interface TypedRequest <P extends Params> extends Express.Request{
	params: P
}

export type Request = TypedRequest<Parameters['params']>`

export const indexFile = `export *  from './schemas.types'
export *  from './responses.types'
export *  as CreateEvent from './CreateEvent'
export *  as GetEvent from './GetEvent'
export *  as GetUserEvents from './GetUserEvents'
`
