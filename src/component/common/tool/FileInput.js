import React, { Component } from 'react';
import PropTypes from 'prop-types';

class FileInput extends React.Component {

    _onChange = event => {
        event.preventDefault();
        const target = event.target;
        let files = target.files;
        const count = this.props.multiple ? files.length : 1;
        for (let i = 0; i < count; i++) {
            files[i].thumb = URL.createObjectURL(files[i])
        }
        // convert to array
        files = Array.prototype.slice.call(files, 0);
        files = files.filter(function (file) {
            return /image/i.test(file.type)
        });
        this.refs.fileInput.value = '';
        this.props.onChange(files, event)
    };
    render() {
        const className = this.props.className;
        return (
            <a href="javascript:void(0);" className={className}>
                <input type="file" multiple={this.props.multiple} accept=".jpe, .jpg, .jpeg, .gif, .png, .bmp" ref="fileInput" onChange={this._onChange} />
                <span>{this.props.btnValue}</span>
            </a>
        )
    }
}

FileInput.defaultProps = {
    multiple: true,
    btnValue: 'Upload Image',
    className: 'upload-button'
};

FileInput.propTypes = {
    onChange: PropTypes.func.isRequired,
    multiple: PropTypes.bool,
    btnValue: PropTypes.string
};
export default FileInput;