import React from 'react';
import { Tag, Input, Tooltip, Button, AutoComplete } from 'antd';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getUserList } from '@/actions/admin';
//value=[{id,name},{id,name}]
class EditableUserTagGroup extends React.Component {
    input = null
    constructor(props) {
        super(props)
        console.log(props)
        this.state = {
            userType: props.userType || 1,
            maxTags: (props.maxTags || 100),//标签最大数量
            tags: (props.value || []).filter(a => a.id != null && a.name != null),
            showEmail: props.showEmail || false,
            inputVisible: false,
            inputValue: '',
            dataSource: []
        };
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = (nextProps.value || []).filter(a => a.id != null && a.name != null);
            this.setState({ tags: (value) });
        }
    }

    renderOption(item) {
        return { value: item.id, text: item.name }//`${item.name}`;
    }
    handleSearch = (value) => {
        if (!value) {
            return;
        }
        var searchOptions = this.props.searchOptions || {};
        this.props.getUserList(value, this.state.userType, this.props.orgId).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setState({
                dataSource: data.data.map((a) => {
                    return { id: `${a.userId}`, name: a.realName }
                })
            })
        })
    }
    onSelect = (value, option) => {
        const state = this.state;
        let tags = state.tags;
        var info = this.state.dataSource.find(a => a.id == option.key);
        if (tags.find(A => A.id == info.id) == null) {
            tags = [...tags, info];
        }
        console.log(tags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
            dataSource: []
        });
        this.triggerChange((tags));//编辑内容回调
    }


    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue);
        }
    }

    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag.id.toString() != removedTag.id);
        console.log(tags);
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
            <div>
                {tags.map((tag, index) => {
                    const isLongTag = tag.name.length > 20;
                    const tagElem = (
                        <Tag key={tag.id} closable afterClose={() => this.handleClose(tag)}>
                            {isLongTag ? `${tag.name.slice(0, 20)}...` : tag.name}
                        </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag.name}>{tagElem}</Tooltip> : tagElem;
                })}
                {inputVisible && (
                    <AutoComplete
                        dataSource={this.state.dataSource.map(this.renderOption)}
                        onSelect={this.onSelect}
                        onSearch={this.handleSearch}
                        placeholder="支持名称模糊搜索"
                    />
                )}
                {!inputVisible && this.state.tags.length < this.state.maxTags && <Button size="small" type="dashed" onClick={this.showInput}>+ 用户</Button>}
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
export default connect(mapStateToProps, mapDispatchToProps)(EditableUserTagGroup);
