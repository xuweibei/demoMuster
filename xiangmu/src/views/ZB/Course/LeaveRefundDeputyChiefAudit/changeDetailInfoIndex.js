/**
 * (总部)转班财务确认管理商品价格详细信息
 * 2018-5-31
 * suicaijiao
 */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table, DatePicker,
    Pagination, Divider, Modal, Card,
    Checkbox,
} from 'antd';
import { env } from '@/api/env';
import SelectArea from '@/components/BizSelect/SelectArea'
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getChangeDetailHeadquartersInfoList } from '@/actions/course';
import SelectItem from '@/components/BizSelect/SelectItem';

class ChangeDetailInfo extends React.Component {
    index_last: number;
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);

        this.state = {
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                studentChangeId: props.studentChangeId
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
        };
        this.index_last = 0;
    }
    componentWillMount() {
        //载入需要的字典项: 审核状态
        this.loadBizDictionary(['dic_YesNo','payee_type','zb_payee_type']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    renderContent = (value, row, index) => {
        const obj = {
            children: value,
            props: {},
        };
        if (index === this.index_last) {
            obj.props.colSpan = 0;
        }
        return obj;
    };

    //table 输出列定义
    columns = [{
        title: '商品名称',
        dataIndex: 'productName',
        width: 180,
        fixed: 'left',
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{text}</span>
            }
            return {
                children: <span></span>,
                props: {
                    colSpan: 1,
                },
            }
        }
    },
    {
        title: '子商品名称',
        dataIndex: 'childProductName',
        render: this.renderContent,
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{text}</span>
            }
            return {
                children: <span>合计：</span>,
                props: {
                    colSpan: 5,
                },
            }
        }
    },
    {
        title: '授课类型',
        dataIndex: 'teachModeName',
        render: this.renderContent,

    },
    {
        title: '是否赠送',
        dataIndex: 'isGive',
        render: (text, record, index) => {
            return this.renderContent(getDictionaryTitle(this.state.dic_YesNo, text), record, index)
        }
    },
    {
        title: '收费方',
        dataIndex: 'payeeType',
        render: (text, record, index) => {
          return this.renderContent(getDictionaryTitle(this.state.payee_type, text), record, index)
        }
      },
      {
        title: '公司',
        dataIndex: 'payeeType',
        render: (text, record, index) => {
          return this.renderContent(getDictionaryTitle(this.state.zb_payee_type, text), record, index)
        }
      },
    {
        title: '子商品缴费金额(¥)',
        dataIndex: 'productPaidAmount',
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{formatMoney(text)}</span>
            }
            var amount = 0;
            this.state.data_list.map(item => {
                amount += parseFloat(item.productPaidAmount || 0);
            })
            return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '扣费金额',
        dataIndex: 'productDeductAmount',
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{formatMoney(text)}</span>
            }
            var amount = 0;
            this.state.data_list.map(item => {
                amount += parseFloat(item.productDeductAmount || 0);
            })
            return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '已退费金额(¥)',
        dataIndex: 'productRefundAmount',
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{formatMoney(text)}</span>
            }
            var amount = 0;
            this.state.data_list.map(item => {
                amount += parseFloat(item.productRefundAmount || 0);
            })
            return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '当前余额(¥)',
        dataIndex: 'paymentBalance',
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{formatMoney(text)}</span>
            }
            var amount = 0;
            this.state.data_list.map(item => {
                amount += parseFloat(item.paymentBalance || 0);
            })
            return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '补扣费金额(¥)',
        dataIndex: 'productAddDeductAmount',
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{formatMoney(text)}</span>
            }
            var amount = 0;
            this.state.data_list.map(item => {
                amount += parseFloat(item.productAddDeductAmount || 0);
            })
            return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '扣费返还金额(¥)',
        dataIndex: 'productAddReturnAmount',
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{formatMoney(text)}</span>
            }
            var amount = 0;
            this.state.data_list.map(item => {
                amount += parseFloat(item.productAddReturnAmount || 0);
            })
            return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '补退费金额(¥)',
        dataIndex: 'productAddRefundAmount',
        width: 120,//可预知的数据长度，请设定固定宽度
        fixed: 'right',
        render: (text, record, index) => {
            if (index < this.index_last) {
                return <span>{formatMoney(text)}</span>
            }
            var amount = 0;
            this.state.data_list.map(item => {
                amount += parseFloat(item.productAddRefundAmount || 0);
            })
            return <span style={{ color: 'red' }}>{formatMoney(amount)}</span>
        }
    }
    ];
    //获取条件列表
    fetch(params) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getChangeDetailHeadquartersInfoList(condition).payload.promise.then((response) => {
            let data = response.payload.data;

            if (data.state === 'success') {
                data.data.push({});
                this.index_last = data.data.length - 1;
                this.setState({
                    pagingSearch: condition,
                    data_list: data.data,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
    };
    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                case "Edit": //提交
            }
        }
    }
    render() {
        let block_content = <div></div>
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];

        block_content = (
            <div>
                <div className="space-default"></div>
                <div className="search-result-list">
                    <Table columns={this.columns} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.data_list}//数据
                        bordered
                        rowKey={record => record.studentChangeId}//主键
                        scroll={{ x: 1300 }}
                    />
                    <div className="space-default"></div>
                    <div className="search-paging">
                        <Row justify="space-between" align="middle" type="flex">
                            <Col span={10}>

                            </Col>
                            <Col span={14} className={'search-paging-control'}>

                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        );
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(ChangeDetailInfo);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getChangeDetailHeadquartersInfoList: bindActionCreators(getChangeDetailHeadquartersInfoList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
