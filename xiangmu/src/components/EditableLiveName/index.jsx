//查询相关大客户
import React from 'react';
import { Tag, Input, Tooltip, Button, AutoComplete,message } from 'antd';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { loadBizDictionary } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, transformListToTree } from '@/utils';
import { queryByLiveName } from '@/actions/live';

class EditablePowerPartnerTagGroup extends React.Component {
    input = null
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            maxTags: (props.maxTags || 100),//标签最大数量
            tags: (props.value || []).filter(a => a.id != null && a.name != null),
            showEmail: props.showEmail || false,
            inputVisible: false,
            inputValue: '',
            dataSource: []
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'university_level']);
    }
    componentWillUnMount() {
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
        
        var searchOptions = this.props.searchOptions || {};
        var re = /[\u4E00-\u9FA5]/g; //测试中文字符的正则

        if (value) {
            
            if (value.length < 3) { //返回中文的个数
                return false;
            }else{
                this.props.queryByLiveName(value).payload.promise.then((response) => {

                    let data = response.payload.data;
                    if (data.state === 'success') {
                        this.setState({
                            dataSource: data.data.map((a) => {
                                
                                return { id: `${a.liveId}`, name: `${a.liveName}` }
                                
                            })
                        })
                    }
                    else {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                })
            }
                
        }
            
        
    }
    onSelect = (value, option) => {
        const state = this.state;
        let tags = state.tags;
        var info = this.state.dataSource.find(a => a.id == option.key);
        if (tags.find(A => A.id == info.id) == null) {
            tags = [...tags, info];
        }
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
                    const isLongTag = tag.name.length > 10;
                    const tagElem = (
                        <Tag key={tag.id} closable afterClose={() => this.handleClose(tag)}>
                            {isLongTag ? `${tag.name.slice(0, 10)}...` : tag.name}
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
            </div>
        );
    }
}



const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        queryByLiveName: bindActionCreators(queryByLiveName, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(EditablePowerPartnerTagGroup);
