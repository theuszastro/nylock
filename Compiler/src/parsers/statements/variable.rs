use crate::utils::AvoidingBlock;
use std::mem::ManuallyDrop;

use crate::parsers::expression;
use crate::utils::{findName, Expression, Pointer, StatementToken, Token};

pub fn variable(
    pointer: &mut ManuallyDrop<Pointer>,
    body: &mut AvoidingBlock,
    isConstant: bool,
) -> Option<StatementToken> {
    pointer.take("Keyword", true, true);

    if let Some(Token::Identifier(name, _)) = pointer.take("Identifier", true, true) {
        let exists = findName(&body.current, name.clone());
        if exists.is_some() {
            pointer.error(format!("Identifier '{}' already declared", name));
        }

        if let Some(Token::Punctuation(punc, _)) = pointer.take("Punctuation", true, true) {
            if punc == "=" {
                let expr = expression(pointer);

                if let Some(expr) = expr {
                    if isConstant {
                        return Some(StatementToken::ConstantDeclaration(name, expr));
                    } else {
                        return Some(StatementToken::VariableDeclaration(name, expr));
                    }
                }

                pointer.error("Expected expression".to_string());
            }
        }

        if isConstant {
            pointer.error("Expected '='".to_string());

            return None;
        }

        return Some(StatementToken::VariableDeclaration(
            name,
            Expression::Undefined,
        ));
    }

    pointer.error(format!(
        "Expected a {} name",
        if isConstant { "constant" } else { "variable" }
    ));

    None
}
