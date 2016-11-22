'use strict';

const assert = require('assert');
const math = require('mathjs');

const LikeTermCollector = require('../lib/LikeTermCollector');
const flatten = require('../lib/flattenOperands');
const print = require('../lib/print');

function testCollectLikeTerms(exprStr, outputStr, explanation='', debug=false) {
  let description = `${exprStr} -> ${outputStr}`;
  if (explanation) {
    description += ` (${explanation})`;
  }
  it(description, function () {
    const exprTree = flatten(math.parse(exprStr));
    const collected = print(LikeTermCollector.collectLikeTermsDFS(exprTree).newNode);
    if (debug) {
      // eslint-disable-next-line
      console.log(collected);
    }
    assert.equal(collected, outputStr);
  });
}

function testCanCollectLikeTerms(exprStr, canCollect, explanation) {
  let description = `${exprStr} -> ${canCollect}`;
  if (explanation) {
    description += ` (${explanation})`;
  }
  it(description , function () {
    const exprTree = flatten(math.parse(exprStr));
    assert.equal(
      LikeTermCollector.canCollectLikeTerms(exprTree),
      canCollect);
  });
}

describe('can collect like terms for addition', function () {
  const tests = [
    ['2+2', false, 'because only one type'],
    ['x^2+x^2', false, 'because only one type'],
    ['x+2', false, 'because all types have only one'],
    ['(x+2+x)', false, 'because in parenthesis, need to be collected first'],
    ['x+2+x', true],
    ['x^2 + 5 + x + x^2', true],
  ];
  tests.forEach(t => testCanCollectLikeTerms(t[0], t[1], t[2]));
});

describe('can collect like terms for multiplication', function () {
  const tests = [
    ['2*2', false, 'because only one type'],
    ['x^2 * 2x^2', true],
    ['x * 2', false, 'because all types have only one'],
    ['((2x^2)) * y * x * y^3', true],
  ];
  tests.forEach(t => testCanCollectLikeTerms(t[0], t[1], t[2]));
});

describe('basic addition collect like terms, no exponents or coefficients', function() {
  const tests = [
    ['2+x+7', 'x + (2 + 7)'],
    ['x + 4 + x + 5', '(x + x) + (4 + 5)'],
    ['x + 4 + y', 'x + 4 + y'],
    ['x + 4 + x + 4/9 + y + 5/7', '(x + x) + y + 4 + (4/9 + 5/7)'],
    ['x + 4 + x + 2^x + 5', '(x + x) + (4 + 5) + 2^x',
      'because 2^x is an \'other\''],
    ['z + 2*(y + x) + 4 + z', '(z + z) + 4 + 2 * (y + x)',
      '2*(y + x) is an \'other\' cause it has parens'],
  ];
  tests.forEach(t => testCollectLikeTerms(t[0], t[1], t[2]));
});

describe('collect like terms with exponents and coefficients', function() {
  const tests = [
    ['x^2 + x + x^2 + x', '(x^2 + x^2) + (x + x)'],
    ['y^2 + 5 + y^2 + 5', '(y^2 + y^2) + (5 + 5)'],
    ['y + 5 + z^2', 'y + 5 + z^2'],
    ['2x^2 + x + x^2 + 3x', '(2x^2 + x^2) + (x + 3x)'],
  ];
  tests.forEach(t => testCollectLikeTerms(t[0], t[1], t[2]));
});

describe('collect like terms for multiplication', function() {
  const tests = [
    ['2x^2 * y * x * y^3', '2 * (x^2 * x) * (y * y^3)'],
    ['y^2 * 5 * y * 9', '(5 * 9) * (y^2 * y)'],
    ['5y^2 * -4y * 9', '(5 * -4 * 9) * (y^2 * y)'],
    ['5y^2 * -y * 9', '(5 * -1 * 9) * (y^2 * y)'],
    ['y * 5 * z^2', 'y * 5 * z^2'],
    ['y * 5 * (2+x) * y^2 * 1/3', '(5 * 1/3) * (y * y^2) * (2 + x)'],
  ];
  tests.forEach(t => testCollectLikeTerms(t[0], t[1], t[2]));
});
