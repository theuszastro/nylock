use std::env::current_dir;

use crate::errors::SyntaxError;
use crate::tokenizer::Tokenizer;
use crate::utils::{ExportedModule, GlobalFunc, ImportedModule, Memorized};

use super::Token;

#[derive(Debug, Clone)]
pub struct Pointer {
    pub tokenizer: Tokenizer,
    pub token: Option<Token>,
    pub globalFunctions: Vec<GlobalFunc>,
    pub imports: Vec<ImportedModule>,
    pub exports: Vec<ExportedModule>,

    pub executable: String,
    pub folder: String,
    pub isNode: bool,
    pub es6: bool,
    pub code: String,
}

impl Pointer {
    pub fn new(tokenizer: Tokenizer, folder: String, isNode: bool, es6: bool) -> Self {
        let mut executable = current_dir().unwrap().to_str().unwrap().to_string();

        executable = executable.replace("/target/debug/Compiler", "");
        executable = executable.replace("/target/release/Compiler", "");

        Self {
            token: None,
            code: String::new(),
            executable,
            folder,
            isNode,
            es6,
            tokenizer,
            imports: vec![],
            exports: vec![],
            globalFunctions: vec![
                GlobalFunc::new("log".to_string(), "console.log".to_string()),
                GlobalFunc::new("warn".to_string(), "console.warn".to_string()),
                GlobalFunc::new("error".to_string(), "console.error".to_string()),
                GlobalFunc::new("info".to_string(), "console.info".to_string()),
                GlobalFunc::new("require".to_string(), "".to_string()),
            ],
        }
    }

    pub fn memorize(&mut self) -> Memorized {
        return Memorized {
            tokenizer: self.tokenizer.memorize(),
            token: self.token.clone(),
        };
    }

    pub fn restore(&mut self, data: Memorized) {
        self.tokenizer.restore(data.tokenizer);
        self.token = data.token;
    }

    pub fn error(&mut self, reason: String) {
        let Tokenizer {
            filename,
            lines,
            line,
            ..
        } = &self.tokenizer;

        SyntaxError::new(filename.clone(), lines.clone(), *line, reason);
    }

    pub fn previewNext(&mut self, skipNewline: bool, skipWhitespace: bool) -> Option<Token> {
        return self.tokenizer.previewNextToken(skipNewline, skipWhitespace);
    }

    pub fn take(&mut self, r#type: &str, skipNewline: bool, skipWhitespace: bool) -> Option<Token> {
        if let Some(token) = self.token.clone() {
            if token.tokenType() == r#type.to_string() {
                self.next(skipNewline, skipWhitespace);

                return Some(token);
            }
        }

        None
    }

    pub fn next(&mut self, skipNewline: bool, skipWhitespace: bool) -> Option<Token> {
        match self.tokenizer.getToken() {
            None | Some(Token::EOF) => {
                self.token = None;

                None
            }
            Some(Token::Newline(_)) if skipNewline => {
                return self.next(skipNewline, skipWhitespace)
            }
            Some(Token::Whitespace(_)) if skipWhitespace => {
                return self.next(skipNewline, skipWhitespace)
            }
            Some(Token::Identifier(data, _)) if data.len() <= 0 => None,
            data => {
                self.token = data.clone();

                return data;
            }
        }
    }
}
