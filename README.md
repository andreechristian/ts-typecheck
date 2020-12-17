# ts-typecheck
A package for checking type in Javascript runtime environment.

## Abstract
Typescript is awesome! I used in production on my Express node server. The thing is, data comes from my UI/Front End developers can be varied in types. Let say i would like a boolean, but my Front Ends can post a `'true'` string instead, which could ruin my server.

That's why i created this package. I want to enable type check onto whatever they throw to my API server.

This checker is intellisense friendly, and will suggest the right type to whatever you need.
## Usage Example
```ts
import typecheck from 'ts-typecheck'

function login(req, res) {
	const body = req.body

	if (typecheck(body, ['object', {
		username: 'string',
		password: 'string',
		type: ['enum?', ['default', 'social', 'sso']]
	}])) {
		...
		// This inner code will only run if req.body is an object with:
		// username as string, password as string, an optional enum type
	}

	// OR, you can do
	if (
		typecheck(body.username, 'string')
		&& typecheck(body.password, 'string')
		&& typecheck(body.type, ['enum?', ['default', 'social', 'sso']])
	) {
		...
	}
}
```

## Supported Types
There are 3 type of types, `Primitives`, `Custom`, and `Configurables`. And on top of that, each of them support optional mark '?'. Optional mark will accept `null` and `undefined` type.
### `Primitives` type are:
- `bigint`
- `boolean`
- `function`
- `number`
- `string`
- `symbol`
- `undefined`
Practically, this is a shorthand for javascript `typeof` equality check. Usage:
```ts
typecheck(1, 'number') // Internaly, it would do `return typeof arguments[0] === 'number'`, returns true
typecheck('1', 'string') // The same, returns true
...
```
### `Custom` type are:
- `date`
Currently `date` is the only supported custom types. Internally it will check is the value a valid date object **or** js date int (e.g: value of `Date.now()`) **or** date string (e.g: `11/11/2011`)
### `Configurables` type are:
- `object`
- `exact`
- `enum`
- `or`
- `array`
- `arrayshape`
These are the more advance use of typechecking. All `Configurables` types need to be supplied as an array of [`type`, `configuration`]. I know, this sounds complicated. Let me explain.

```ts
const user = {
	id: 1,
	name: 'Andree',
	roles: ['admin', 'user'],
	nationality: 'ID',
	phone: '+62 859 XXXX XXXX',
	metadata: {
		age: 21,
		log: ['ID', '12/12/2020 18:59', true]
	}
}

typecheck(user, ['object', {
	id: 'number',
	name: 'string',
	roles: ['array', ['enum', ['admin', 'user', 'superadmin']]]
	nationality: ['enum?', ['ID', 'AU', 'SG', 'US', 'UK']]
	phone: ['or?', ['string', 'number']]
	metadata: ['object?', {
		age: 'number?',
		log: ['arrayshape?', [['enum', ['ID', 'AU', 'SG', 'US', 'UK']], 'date', 'boolean']]
	}]
}])

// returns true
```
On the example above, the typecheck will return `true`. It will first check if `user` is an `object` that has `id`, `name`, `roles`, `nationality` (optional), `phone` (optional), and `metadata` (optional) as keys. Then it will proceed by checking if `roles` is an array of `enum` (one of: `admin`, `user`, or `superadmin`). The same goes for nationality. As for `phone`, it will check whether it satisfy either `string` or `number`. Next, it will check for `metadata`, and goes deeper to check the `age` and `log` keys. For `log`, it will check whether it is shaped as an array of [`enum` of nationality, `date`, `boolean`] or not. Using the same typecheck,
```ts
const user2 = {
	id: 2,
	name: 'John',
	roles: ['user'],
}

typecheck(user2, ...)
// returns true

const user3 = {
	id: 3,
	name: 'John',
	roles: ['user'],
	phone: 859123123123,
}

typecheck(user3, ...)
// also returns true

const user4 = {
	id: 4,
	name: 'Jane',
}

typecheck(user4, ...)
// returns false

const user5 = {
	id: 5,
	name: 'Jude',
	roles: ['user'],
	metadata: {}
}

typecheck(user5, ...)
// returns true

const user6 = {
	id: 6,
	name: 'Job',
	roles: ['user'],
	metadata: {
		log: ['ID']
	}
}

typecheck(user6, ...)
// returns false
```
#### `object` type
Check whether the value is an object that has at least the configured keys. If there are more keys than the configured one, the object will still pass the typecheck. For more strict object typecheck, please use `exact`.
```ts
const check: AllConfigurableTypes = ['object', {
	id: 'number',
	name: 'string',
}]

typecheck({
	id: 1,
	name: 'Andree'
	bio: 'Lorem ipsum...',
})
// returns true
```
#### `exact` type
Check whether the value is an object that has the same key as the configured keys.
```ts
const check: AllConfigurableTypes = ['exact', {
	id: 'number',
	name: 'string',
}]

typecheck({
	id: 1,
	name: 'Andree'
	bio: 'Lorem ipsum...',
})
// returns false
```
#### `enum` type
Check whether the supplied value satisfy any value of the supplied array.
```ts
typecheck('ID', ['enum', ['ID', 'AU', 'SG', 'US', 'UK']])
// returns true

typecheck('EN', ['enum', ['ID', 'AU', 'SG', 'US', 'UK']])
// returns false
```
#### `or` type
Check whether the supplied value satisfy any type of the supplied array. It's like `enum` for types.
```ts
typecheck('ID', ['or', ['string', 'number']])
// returns true

typecheck(1, ['or', ['string', 'number']])
// returns true

typecheck(true, ['or', ['string', 'number']])
// returns false
```
#### `array` type
Check whether the supplied value is an array.
```ts
typecheck(['ID'], ['array', 'string'])
// returns true

typecheck(['ID'], ['array', 'number'])
// returns false

typecheck(['ID'], ['array', ['enum', ['ID', 'AU', 'SG', 'US', 'UK']]])
// returns true

typecheck(['ID', 'ID', 'ID'], ['array', ['enum', ['ID', 'AU', 'SG', 'US', 'UK']]])
// returns true

typecheck(['ID', 'AU', 'UK', 'PH'], ['array', ['enum', ['ID', 'AU', 'SG', 'US', 'UK']]])
// returns false

typecheck([{
	id: 1,
	name: 'Andree',
}, {
	id: 2,
	name: 'John'
	nationality: 'ID',
}], ['array', ['object', {
	id: 'number',
	name: 'string',
	nationality: ['enum?', ['ID', 'AU', 'SG', 'US', 'UK']]
}]])
// returns true
```
#### `arrayshape` type
Check whether the supplied value has an exact shape of the configured array.
```ts
typecheck([1, 'Andree'], ['arrayshape', ['number', 'string']])
// returns true

typecheck([1, 'Andree'], ['arrayshape', ['number', 'string', 'boolean']])
// returns false
```
That's it folks! I am open to suggestion. Thanks for reading. Open ticket for any questions or bug. Helping hands are welcomed!