/**
 * Created by xiao on 2017/5/8.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import './footer.css';

class Footer extends Component {
    render(){
        const { backGroundImg } = this.props;
        return (
            <footer id="footer">
                <ul className="copyright">
                    <li>© 、  这不科学. All rights reserved.</li><li>Design: <a href="javascript:void(0);">、  这不科学</a></li>

                </ul>
            </footer>
        );
    }
}

Footer.propTypes = {

};

Footer.defaultProps = {

};

export default Footer;