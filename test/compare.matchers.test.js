const suite = require('uvu').suite;
const assert = require('uvu/assert');
const { string, int, float, like, regex, oneOf, oneOfType, expression, gt, any, utils } = require('../src/index');
const { setMatchingRules, getValue, compare } = utils;

const test = suite('Compare With Matchers');

test('like - root string', () => {
  const actual = 'null';
  const value = like('some string');
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('like - root object', () => {
  const actual = {
    name: 'jon',
    age: 8
  };
  const value = like({
    name: 'snow',
    age: 18
  });
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('like - root object - extra prop in expected', () => {
  const actual = {
    name: 'jon',
    age: 8
  };
  const value = like({
    name: 'snow',
    age: 18,
    house: 'stark'
  });
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have property 'house' at '$.body'`);
});

test('like - root object - extra prop in actual', () => {
  const actual = {
    name: 'jon',
    age: 8,
    house: 'stark'
  };
  const value = like({
    name: 'snow',
    age: 18
  });
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, ``);
});

test('like - prop object', () => {
  const actual = {
    name: 'jon',
    age: 8
  };
  const value = {
    name: like('snow'),
    age: 8
  };
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('like - prop object different type', () => {
  const actual = {
    name: 'jon',
    age: 8
  };
  const value = {
    name: like({ first: 'jon', last: 'snow' }),
    age: 8
  };
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have type 'object' at '$.body.name' but found 'string'`);
});

test('like - prop object in array', () => {
  const actual = ['node', '-v', 823];
  const value = ['node', '-v', like(1)];
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, ``);
});

test('like - prop object in array different type', () => {
  const actual = ['node', '-v', 823];
  const value = ['node', '-v', like('1')];
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have type 'string' at '$.body[2]' but found 'number'`);
});

test('like - prop object in array inside nested object', () => {
  const actual = {
    cmd: ['node', '-v', 823]
  };
  const value = {
    cmd: ['node', '-v', like(1)]
  };
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, ``);
});

test('like - prop object in array inside nested object', () => {
  const actual = {
    cmd: ['node', '-v', 823]
  };
  const value = {
    cmd: ['node', '-v', like('1')]
  };
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have type 'string' at '$.body.cmd[2]' but found 'number'`);
});

test('like - nested matchers - pass', () => {
  const actual = {
    name: 'jon',
    age: 8,
    address: {
      line: 'flat',
      zip: null
    }
  };
  const value = like({
    name: 'snow',
    age: gt(5),
    address: like({
      line: 'flat',
      zip: any('123')
    })
  });
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('like - nested matchers - fail at root', () => {
  const actual = {
    name: 'jon',
    age: 8,
    address: {
      line: 'flat',
      zip: null
    }
  };
  const value = like({
    name: 'snow',
    age: gt(10),
    address: like({
      line: 'flat',
      zip: any('123')
    })
  });
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have 'greater' value than '10' at '$.body.age' but found '8'`);
});

test('like - nested matchers - fail at nested', () => {
  const actual = {
    name: 'jon',
    age: 8,
    address: {
      line: 'flat',
      zip: 3
    }
  };
  const value = like({
    name: 'snow',
    age: gt(7),
    address: like({
      line: 'flat',
      zip: gt(7)
    })
  });
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have 'greater' value than '7' at '$.body.address.zip' but found '3'`);
});

test('regex - root string', () => {
  const actual = 'null';
  const value = regex('some string', /\w+/);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('regex - root string does not match', () => {
  const actual = 98;
  const value = regex('some string', /\D+/);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't match with "\\D+" at "$.body" but found "98"`);
});

test('regex - prop object', () => {
  const actual = {
    name: 'jon',
    age: 8
  };
  const value = {
    name: regex('snow', /\w+/),
    age: 8
  };
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOf - root string', () => {
  const actual = 'API';
  const value = oneOf(['UI', 'API']);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOf - root string fails', () => {
  const actual = 'AP';
  const value = oneOf(['UI', 'API']);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have one of the expected values at "$.body" but found "AP"`);
});

test('expr - prop object', () => {
  const actual = {
    name: 'jon',
    age: 8
  };
  const value = {
    name: 'jon',
    age: expression(9, '$V > 0')
  };
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('expr - prop object fails', () => {
  const actual = {
    name: 'jon',
    age: 8
  };
  const value = {
    name: 'jon',
    age: expression(9, '$V > 10')
  };
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't fulfil expression '$.body.age > 10'`);
});

test('oneOfType - root string', () => {
  const actual = 'API';
  const value = oneOfType([string(), int()]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOfType - root int', () => {
  const actual = 123;
  const value = oneOfType([int(), string()]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOfType - root float', () => {
  const actual = 123.12;
  const value = oneOfType([float(), string()]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOfType - root null', () => {
  const actual = null;
  const value = oneOfType([string(), null]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOfType - root []', () => {
  const actual = [];
  const value = oneOfType([[], int()]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOfType - root [string()]', () => {
  const actual = ['API','MAPI'];
  const value = oneOfType([[string()], null]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOfType - root [int()]', () => {
  const actual = [321,123];
  const value = oneOfType([[int()], null]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, '');
});

test('oneOfType - root value fails', () => {
  const actual = null;
  const value = oneOfType([string(), int()]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have one of the expected types at "$.body" but found "null" of type "null"`);
});

test('oneOfType - root value [] fails', () => {
  const actual = [];
  const value = oneOfType([string(), int()]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have one of the expected types at "$.body" but found "" of type "array"`);
});

test('oneOfType - root value ["API"] fails', () => {
  const actual = ["API"];
  const value = oneOfType([[], int()]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have one of the expected types at "$.body" but found "API" of type "array"`);
});

test('oneOfType - root value [123] fails', () => {
  const actual = [123];
  const value = oneOfType([string(), []]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have one of the expected types at "$.body" but found "123" of type "array"`);
});

test('oneOfType - root value [123] fails oneOfType([[string()], [float()]])', () => {
  const actual = [123];
  const value = oneOfType([[string()], [float()]]);
  const rules = setMatchingRules({}, value, '$.body');
  const expected = getValue(value);
  const { message } = compare(actual, expected, rules, '$.body');
  assert.equal(message, `Json doesn't have one of the expected types at "$.body" but found "123" of type "array"`);
});

test.run();