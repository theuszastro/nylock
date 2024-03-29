use std::mem::ManuallyDrop;

use super::expression;

use crate::utils::{Expression, HoistingBlock, Pointer, Token};

pub fn object(pointer: &mut ManuallyDrop<Pointer>, body: &mut HoistingBlock) -> Option<Expression> {
    let mem = pointer.memorize();

    pointer.take("Brackets", true, true);

    let mut values: Vec<(String, Expression)> = vec![];

    loop {
        match pointer.token.clone() {
            Some(Token::Brackets(bra, _)) if bra == "}" => break,
            _ => {
                let mut key = String::new();

                let identifer = pointer.take("Identifier", true, true);
                if identifer.is_none() {
                    let keyString = expression(pointer, body);
                    if keyString.is_none() {
                        pointer.restore(mem);

                        return None;
                    }

                    if let Some(Expression::String(value)) = keyString {
                        key = value;
                    } else {
                        pointer.error("Expected 'String'".to_string());
                    }
                } else {
                    key = identifer.unwrap().tokenValue();
                }

                let colon = pointer.take("Punctuation", true, true);
                if colon.is_none() || colon.unwrap().tokenValue() != ":" {
                    pointer.error("Expected ':'".to_string());
                }

                let value = expression(pointer, body);
                if value.is_none() {
                    pointer.error("Expected Expression".to_string());
                }

                values.push((key, value.unwrap()));

                match pointer.token.clone() {
                    Some(Token::Punctuation(pun, _)) => {
                        if pun == "," {
                            pointer.next(true, true);

                            continue;
                        }

                        break;
                    }
                    _ => {
                        let expr = expression(pointer, body);
                        if expr.is_some() {
                            pointer.error("Expected ','".to_string());
                        }
                    }
                }
            }
        }
    }

    let close = pointer.take("Brackets", true, true);
    if close.is_none() || close.unwrap().tokenValue() != "}" {
        pointer.error("Expected '}'".to_string());
    }

    Some(Expression::Object(values))
}
