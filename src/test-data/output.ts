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

interface TypedRequest <T extends Query,U> extends Express.Request{
	query: T
	body: U
}

export type Request = TypedRequest<Parameters['query'],RequestBody>`

export const getEventFile = `import { SingleEventResponse, ServerErrorResponse } from './responses.types'

import { EventUuid as EventUuid } from './schemas.types'

import { Query } from 'express-serve-static-core'

interface Parameters {
	path: {
		eventUuid: EventUuid
	}
}

export interface Responses {
	200: SingleEventResponse
	default: ServerErrorResponse
}

interface TypedRequest <T extends Query> extends Express.Request{
	query: T
}

export type Request = TypedRequest<Parameters['query']>`

export const getUserEventsFile = `import { MultipleEventResponse, ServerErrorResponse } from './responses.types'

import { UserUuid as PathUserUuid } from './schemas.types'

import { Query } from 'express-serve-static-core'

interface Parameters {
	path: {
		userUuid: PathUserUuid
	}
}

export interface Responses {
	200: MultipleEventResponse
	default: ServerErrorResponse
}

interface TypedRequest <T extends Query> extends Express.Request{
	query: T
}

export type Request = TypedRequest<Parameters['query']>`

export const indexFile = `export *  from './schemas.types'
export *  from './responses.types'
export *  as CreateEvent from './CreateEvent'
export *  as GetEvent from './GetEvent'
export *  as GetUserEvents from './GetUserEvents'
`
