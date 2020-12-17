type Primitives = 'bigint'
	| 'boolean'
	| 'function'
	| 'number'
	| 'string'
	| 'symbol'
	| 'undefined'

type OptionalPrimitives = 'bigint?'
	| 'boolean?'
	| 'function?'
	| 'number?'
	| 'string?'
	| 'symbol?'
	| 'undefined?'

type Customs = 'date'

type OptionalCustoms = 'date?'

type Objects = 'object'

type OptionalObjects = 'object?'

type Exacts = 'exact'

type OptionalExacts = 'exact?'

type Enums = 'enum'

type OptionalEnums = 'enum?'

type Ors = 'or'

type OptionalOrs = 'or?'

type Arrays = 'array'

type OptionalArrays = 'array?'

type ArrayShapes = 'arrayshape'

type OptionalArrayShapes = 'arrayshape?'

type Types = Primitives | Customs // | Objects | Enums | Ors

type OptionalTypes = OptionalPrimitives | OptionalCustoms // | OptionalObjects | OptionalEnums | OptionalOrs

type ConfigurableTypes = [Objects, AllTypesShape]
	| [Enums, string[]]
	| [Ors, AllTypes[]]
	| [Arrays, AllTypes]
	| [Exacts, AllTypesShape]
	| [ArrayShapes, AllTypes[]]

type OptionalConfigurableTypes = [OptionalObjects, AllTypesShape]
	| [OptionalEnums, string[]]
	| [OptionalOrs, AllTypes[]]
	| [OptionalArrays, AllTypes]
	| [OptionalExacts, AllTypesShape]
	| [OptionalArrayShapes, AllTypes[]]

// export
export type AllTypes = Types | OptionalTypes | ConfigurableTypes | OptionalConfigurableTypes

// export
export type AllConfigurableTypes = ConfigurableTypes | OptionalConfigurableTypes

// export
export type AllNonConfigurableTypes = Types | OptionalTypes

interface AllTypesShape {
	[key: string]: AllTypes
}

function _isTruthy(value: any) {
	return !!value || value === 0
}

function _isOptional(type: AllTypes) {
	let _type: Types | OptionalTypes | ConfigurableTypes[0] | OptionalConfigurableTypes[0]

	if (Array.isArray(type)) {
		// Configurables
		_type = type[0]
	} else {
		// Non Configurables
		_type = type
	}

	return _type[_type.length - 1] === '?'
}

function isDate(value: any): boolean {
	const date = new Date(value)
	return date.getTime() === date.getTime()
}

function isEnum(value: any, config: string[]): boolean {
	return config.indexOf(value) > -1
}

function isOr(value: any, config: AllTypes[]): boolean {
	return config.findIndex(type => {
		return check(value, type)
	}) > -1
}

function isArray(values: any, type: AllTypes): boolean {
	return Array.isArray(values) && values.findIndex(value => {
		return !check(value, type)
	}) === -1
}

function isArrayShape(values: any, type: AllTypes[]): boolean {
	const requiredLength = type.map(t => !_isOptional(t)).reduce((sum, curr) => sum + Number(curr), 0)
	return Array.isArray(values) && values.length >= requiredLength && values.length <= type.length && values.findIndex((value, i) => {
		return !check(value, type[i])
	}) === -1
}

function isShape(value: { [k: string]: any }, config: AllTypesShape): boolean {
	if (_isTruthy(value)) {
		const keys = Object.keys(config) as Array<keyof typeof config>

		return keys.findIndex(key => {
			return !check(value[key], config[key])
		}) === -1
	} else {
		return false
	}
}

function isExact(value: { [k: string]: any }, config: AllTypesShape): boolean {
	if (_isTruthy(value)) {
		const cKeys = Object.keys(config) as Array<keyof typeof config>
		const vKeys = Object.keys(value)

		// Find for extra keys
		const noextra = vKeys.map(vkey => {
			return cKeys.indexOf(vkey) > -1
		}).findIndex(key => key === false) === -1

		// Find for missing keys
		const nomissing = cKeys.map(ckey => {
			// Check for optional types
			return _isOptional(config[ckey]) ? true : vKeys.indexOf(ckey as any) > -1
		}).findIndex(key => key === false) === -1

		return noextra && nomissing && isShape(value, config)
	} else {
		return false
	}
}

function optional(value: any, type: Types | ConfigurableTypes[0], config: ConfigurableTypes[1] | null): boolean {
	return value === undefined || value === null
		? true
		: required(value, type, config)
}

function required(value: any, type: Types | ConfigurableTypes[0], config: ConfigurableTypes[1] | null): boolean {
	if (config !== null) {
		// Configurable Types
		switch (type) {
			case 'exact':
				return isExact(value, config as AllTypesShape)
			case 'object':
				return isShape(value, config as AllTypesShape)
			case 'array':
				return isArray(value, config as AllTypes)
			case 'arrayshape':
				return isArrayShape(value, config as AllTypes[])
			case 'enum':
				return isEnum(value, config as string[])
			case 'or':
				return isOr(value, config as AllTypes[])
			default:
				throw new Error(`Non existent configurable types "${ type }"!`)
		}
	} else {
		// Non Configurable Types
		switch (type) {
			case 'date':
				return isDate(value)
			case 'number':
				return typeof value === type && !isNaN(value)
			default:
				return typeof value === type
		}
	}
}

// export
export function check(value: any, type: AllTypes): boolean {
	let _type: Types | OptionalTypes | ConfigurableTypes[0] | OptionalConfigurableTypes[0]
	let _config: ConfigurableTypes[1] | OptionalConfigurableTypes[1] | null

	if (Array.isArray(type)) {
		// Configurables
		_type = type[0]
		_config = type[1]
	} else {
		// Non Configurables
		_type = type
		_config = null
	}

	const len = _type.length - 1
	const isOptional = _type[len] === '?'

	if (isOptional) {
		return optional(value, _type.substr(0, len) as Types | ConfigurableTypes[0], _config)
	} else {
		return required(value, _type as Types | ConfigurableTypes[0], _config)
	}
}
