/**
 * This file is transliterated into JavaScript from genanki's Python version,
 * available here:
 * https://github.com/kerrickstaley/genanki/blob/c0ac89a72ce1c7f778d1543b0b155a16d40572b7/genanki/__init__.py#L18-L44
 *
 * The original is licensed as MIT, and so is this version (though the rest of
 * mkanki is licensed AGPLv3).
 *
 * The following license applies to this file only.
 *
 * Copyright (c) 2017 Kerrick Staley and Jeremy Apthorp.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

BASE91_TABLE = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
  't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4',
  '5', '6', '7', '8', '9', '!', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '/', ':',
  ';', '<', '=', '>', '?', '@', '[', ']', '^', '_', '`', '{', '|', '}', '~']

function ankiHash(fields) {
  const str = fields.join('__')
  const h = sha256.create();
  h.update(str)
  const hex = h.digest()

  let hash_int = 0n
  for (let i = 0; i < 8; i++) {
    hash_int *= 256n
    hash_int += BigInt(hex[i])
  }

  // convert to the weird base91 format that Anki uses
  let rv_reversed = []
  while (hash_int > 0) {
    rv_reversed.push(BASE91_TABLE[hash_int % 91n])
    hash_int = (hash_int / 91n)
  }

  return rv_reversed.reverse().join('')
}
