//标准组件环境  咨询情况 
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities,qryAskByStudentId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';



class Counselling extends React.Component {

    columns = [
        {
            title: '类型',
            dataIndex: 'askType',
            render: (text, record, index) => {
                switch (record.askType) {
                    case 1:
                        return "电咨";
                    case 2:
                        return "面咨";
                }
            }
            
        }, {
            title: '咨询日期',
            dataIndex: 'askDate',
            render: (text, record, index) => (`${timestampToTime(record.askDate)}`)
        },
        {
            title: '咨询内容',
            dataIndex: 'askContent',
        },
        {
            title: '邀约日期',
            dataIndex: 'inviteDate',
            render: (text, record, index) => (`${timestampToTime(record.inviteDate)}`)
        },
        {
            title: '邀约备注',
            dataIndex: 'remark',
        },
        {
            title: '下次咨询日期',
            dataIndex: 'nextAskDate',
            render: (text, record, index) => (`${timestampToTime(record.nextAskDate)}`)
        },
        {
            title: '下次咨询内容',
            dataIndex: 'nextAskContent',
        },
        {
            title: '咨询人',
            dataIndex: 'createUserName',
        },
    ]
    constructor(props) {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            currentDataModel: null,
            loading: false,
            data: []
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //检索数据
    fetch = () => {
        this.setState({ loading: true });
        this.props.qryAskByStudentId({studentId:this.props.studentId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = []
                data.data = data.data || []
                data.data.map(item => {
                    item.key = item.studentAskId;
                    list.push(item);
                })
                this.setState({
                    data: list,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false, data: [] })
                message.error(data.message);
            }
        })
    }

    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content_1 =
            <ContentBox titleName='咨询信息' hideBottomBorder={false}>
                <div className="dv_split"></div>
                <div className="search-result-list">
                    <Table columns={this.columns} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.data}//数据
                        bordered
                    /></div>
                <div className="dv_split"></div>
            </ContentBox>

        let block_content = <div>
            {block_content_1}

        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedCounselling = Form.create()(Counselling);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        qryAskByStudentId: bindActionCreators(qryAskByStudentId, dispatch),//根据学生id查询咨询情况
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCounselling);
