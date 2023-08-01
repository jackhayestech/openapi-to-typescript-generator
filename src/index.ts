#!/usr/bin/env node

import fs from 'fs'
import { parse } from 'yaml'

import { GenerateTypescript } from './generation/generateTypescript'
import { getFlag } from './utilities'

const fileName = getFlag(process.argv, '-i') as string
const output = getFlag(process.argv, '-o') as string

const file = fs.readFileSync(fileName, 'utf8')
const { paths, components } = parse(file)

new GenerateTypescript(paths, components, output)
