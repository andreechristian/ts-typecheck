declare type Primitives = 'bigint' | 'boolean' | 'function' | 'number' | 'string' | 'symbol' | 'undefined';
declare type OptionalPrimitives = 'bigint?' | 'boolean?' | 'function?' | 'number?' | 'string?' | 'symbol?' | 'undefined?';
declare type Customs = 'date';
declare type OptionalCustoms = 'date?';
declare type Objects = 'object';
declare type OptionalObjects = 'object?';
declare type Exacts = 'exact';
declare type OptionalExacts = 'exact?';
declare type Enums = 'enum';
declare type OptionalEnums = 'enum?';
declare type Ors = 'or';
declare type OptionalOrs = 'or?';
declare type Arrays = 'array';
declare type OptionalArrays = 'array?';
declare type ArrayShapes = 'arrayshape';
declare type OptionalArrayShapes = 'arrayshape?';
declare type Types = Primitives | Customs;
declare type OptionalTypes = OptionalPrimitives | OptionalCustoms;
declare type ConfigurableTypes = [Objects, AllTypesShape] | [Enums, string[]] | [Ors, AllTypes[]] | [Arrays, AllTypes] | [Exacts, AllTypesShape] | [ArrayShapes, AllTypes[]];
declare type OptionalConfigurableTypes = [OptionalObjects, AllTypesShape] | [OptionalEnums, string[]] | [OptionalOrs, AllTypes[]] | [OptionalArrays, AllTypes] | [OptionalExacts, AllTypesShape] | [OptionalArrayShapes, AllTypes[]];
export declare type AllTypes = Types | OptionalTypes | ConfigurableTypes | OptionalConfigurableTypes;
export declare type AllConfigurableTypes = ConfigurableTypes | OptionalConfigurableTypes;
export declare type AllNonConfigurableTypes = Types | OptionalTypes;
interface AllTypesShape {
    [key: string]: AllTypes;
}
export declare function check(value: any, type: AllTypes): boolean;
export {};
