import React from 'react';
import { message, Tag, Col, Input, Tooltip, Button, AutoComplete } from 'antd';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getUserList } from '@/actions/admin';

import './payNumSelect.less';
//value=[{id,name},{id,name}]
class EditPayNumSelect extends React.Component {
    input = null
    constructor(props) {
        super(props)
        this.state = {
            userType: props.userType || 1,
            maxTags: (props.maxTags || 100),//标签最大数量
            tags: (props.value || []).filter(a => a != null && a != null),
            showEmail: props.showEmail || false,
            inputVisible: false,
            inputValue: '',
            dataSource: [],
            value:''
        };
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = (nextProps.value || []).filter(a => a != null && a != null);
            this.setState({ tags: (value) });
        }
    }

    renderOption(item) {
        return { value: item.id, text: item.name }//`${item.name}`;
    }
    handleSearch = (value) => {
        if(!value){
          return;
        }
        var searchOptions = this.props.searchOptions || {};
        this.props.getUserList(value, this.state.userType, null).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setState({
                dataSource: data.data.map((a) => {
                    return { id: `${a.userId}`, name: a.realName }
                })
            })
        })
    }
    onSelect = () => {

        let val = this.state.value;
        if( val== ''){
            message.error('请输入支付流水号！');
            return;
        }
        const state = this.state;
        let tags = state.tags;
        if (tags.find(A => A == val) == null) {
            tags.push(val);
        }else{
            message.error('请不要重复输入流水号！');
            return;
        }
        
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
            dataSource: []
        });
        this.triggerChange((tags));//编辑内容回调

        this.setState({
            value: ''
        });

    }


    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue);
        }
    }

    handleChange = (option) => {
        let val = option.target.value;
        this.setState({
            value: val
        });
    }

    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag.toString() != removedTag);
        this.setState({ tags });
        this.triggerChange((tags));//编辑内容回调
    }

    showInput = () => {
        this.setState({ inputVisible: true });
    }
    render() {
        let { tags, inputVisible, inputValue } = this.state;
        if (tags.length == 0) {
            inputVisible = true
        }
        return (
            <div className="payNumBox">
                <Col span={9}>
                    <Input placeholder="请输入支付流水号并添加到右侧框里" ref="payNumInput" value={this.state.value} onChange={this.handleChange} />
                    {/*<AutoComplete
                        dataSource={this.state.dataSource.map(this.renderOption)}
                        onSelect={this.onSelect}
                        onSearch={this.handleSearch}
                    />*/}
                </Col>
                <Col span={4}>
                    <Button onClick={this.onSelect}>添加</Button>
                </Col>
                <Col span={11}>
                    {tags.map((tag, index) => {
                        const isLongTag = tag.length > 20;
                        const tagElem = (
                            <Tag key={tag} closable afterClose={() => this.handleClose(tag)}>
                                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                            </Tag>
                        );
                        return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                    })}
                </Col>
            </div>
        );
    }
}



const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
        getUserList: bindActionCreators(getUserList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(EditPayNumSelect);
