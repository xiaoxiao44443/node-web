/**
 * Created by xiao on 2017/5/14.
 */
/**
 * Created by xiao on 2017/5/13.
 */
import React from 'react'
import markdownIt from 'markdown-it';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

const supportTypes = ['prism-abap.js','prism-actionscript.js','prism-ada.js','prism-apacheconf.js','prism-apl.js','prism-applescript.js','prism-asciidoc.js','prism-aspnet.js','prism-autohotkey.js','prism-autoit.js','prism-bash.js','prism-basic.js','prism-batch.js','prism-bison.js','prism-brainfuck.js','prism-bro.js','prism-c.js','prism-clike.js','prism-coffeescript.js','prism-core.js','prism-cpp.js','prism-crystal.js','prism-csharp.js','prism-css.js','prism-css-extras.js','prism-d.js','prism-dart.js','prism-diff.js','prism-docker.js','prism-eiffel.js','prism-elixir.js','prism-erlang.js','prism-fortran.js','prism-fsharp.js','prism-gherkin.js','prism-git.js','prism-glsl.js','prism-go.js','prism-graphql.js','prism-groovy.js','prism-haml.js','prism-handlebars.js','prism-haskell.js','prism-haxe.js','prism-http.js','prism-icon.js','prism-inform7.js','prism-ini.js','prism-j.js','prism-jade.js','prism-java.js','prism-javascript.js','prism-jolie.js','prism-json.js','prism-jsx.js','prism-julia.js','prism-keyman.js','prism-kotlin.js','prism-latex.js','prism-less.js','prism-livescript.js','prism-lolcode.js','prism-lua.js','prism-makefile.js','prism-markdown.js','prism-markup.js','prism-matlab.js','prism-mel.js','prism-mizar.js','prism-monkey.js','prism-nasm.js','prism-nginx.js','prism-nim.js','prism-nix.js','prism-nsis.js','prism-objectivec.js','prism-ocaml.js','prism-oz.js','prism-parigp.js','prism-parser.js','prism-pascal.js','prism-perl.js','prism-php.js','prism-php-extras.js','prism-powershell.js','prism-processing.js','prism-prolog.js','prism-properties.js','prism-protobuf.js','prism-puppet.js','prism-pure.js','prism-python.js','prism-q.js','prism-qore.js','prism-r.js','prism-reason.js','prism-rest.js','prism-rip.js','prism-roboconf.js','prism-ruby.js','prism-rust.js','prism-sas.js','prism-sass.js','prism-scala.js','prism-scheme.js','prism-scss.js','prism-smalltalk.js','prism-smarty.js','prism-sql.js','prism-stylus.js','prism-swift.js','prism-tcl.js','prism-textile.js','prism-twig.js','prism-typescript.js','prism-verilog.js','prism-vhdl.js','prism-vim.js','prism-wiki.js','prism-xojo.js','prism-yaml.js'];


const aliases = {
    'js': 'jsx',
    'html': 'markup',
    'sh': 'bash',
    'flow': 'jsx'
};

const highlight = (str, lang) => {
    if (!lang) {
        return str
    } else {
        lang = aliases[lang] || lang;
        if(supportTypes.indexOf(`prism-${lang}.js`)!==-1){
            require(`prismjs/components/prism-${lang}.js`);
        }
        if (Prism.languages[lang]) {
            return Prism.highlight(str, Prism.languages[lang])
        } else {
            return str
        }
    }
};
const markdown = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight
});

export default markdown;   //markdown.render(xxx)